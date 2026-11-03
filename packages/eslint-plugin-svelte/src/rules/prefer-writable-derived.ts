import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { FindVariableContext, getScope } from '../utils/ast-utils.js';
import type { RuleContext } from '../types.js';
import { getPropertyName } from '@eslint-community/eslint-utils';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
import semver from 'semver';

// Writable derived were introduced in Svelte 5.25.0
const shouldRun = semver.satisfies(SVELTE_VERSION, '>=5.25.0');

type ValidFunctionType = TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
type ValidFunction = ValidFunctionType & {
	body: TSESTree.BlockStatement;
};

type ValidAssignmentExpression = TSESTree.AssignmentExpression & {
	operator: '=';
	left: TSESTree.Identifier;
};

type ValidExpressionStatement = TSESTree.ExpressionStatement & {
	expression: ValidAssignmentExpression;
};

function isEffectOrEffectPre(node: TSESTree.CallExpression) {
	if (node.callee.type === 'Identifier') {
		return node.callee.name === '$effect';
	}
	if (node.callee.type === 'MemberExpression') {
		return (
			node.callee.object.type === 'Identifier' &&
			node.callee.object.name === '$effect' &&
			node.callee.property.type === 'Identifier' &&
			node.callee.property.name === 'pre'
		);
	}

	return false;
}

function isValidFunctionArgument(argument: TSESTree.Node): argument is ValidFunction {
	if (
		(argument.type !== 'FunctionExpression' && argument.type !== 'ArrowFunctionExpression') ||
		argument.params.length !== 0
	) {
		return false;
	}

	if (argument.body.type !== 'BlockStatement') {
		return false;
	}

	return argument.body.body.length === 1;
}

function isValidAssignment(statement: TSESTree.Statement): statement is ValidExpressionStatement {
	if (statement.type !== 'ExpressionStatement') return false;

	const { expression } = statement;
	return (
		expression.type === 'AssignmentExpression' &&
		expression.operator === '=' &&
		expression.left.type === 'Identifier'
	);
}

function isStateVariable(init: TSESTree.Expression | null): init is TSESTree.CallExpression {
	return (
		init?.type === 'CallExpression' &&
		init.callee.type === 'Identifier' &&
		init.callee.name === '$state'
	);
}

// Methods that mutate the object they are called on.
// `$state` does not proxy Map / Set, but their method names are included to be safe,
// since the rule can't know the type of the object.
const MUTATING_METHODS = new Set([
	// Array
	'copyWithin',
	'fill',
	'pop',
	'push',
	'reverse',
	'shift',
	'sort',
	'splice',
	'unshift',
	// Map / Set
	'add',
	'clear',
	'delete',
	'set'
]);

// Static methods that mutate their first argument.
const MUTATING_STATIC_METHODS = new Map([
	['Object', new Set(['assign', 'defineProperties', 'defineProperty', 'setPrototypeOf'])],
	['Reflect', new Set(['defineProperty', 'deleteProperty', 'set', 'setPrototypeOf'])]
]);

// Methods whose callbacks get an accumulator as the first parameter.
// It is an element only when no initial value is given.
// For other methods, all parameters of callbacks are treated as elements.
const REDUCE_METHODS = new Set(['reduce', 'reduceRight']);

// Methods that return a new array. The array itself is new, but its elements are still shared.
const NEW_ARRAY_METHODS = new Set([
	'concat',
	'filter',
	'flat',
	'flatMap',
	'map',
	'slice',
	'toReversed',
	'toSorted',
	'toSpliced',
	'with',
	// String methods. Their elements are new, too.
	'match',
	'split',
	// Iterator method.
	'toArray'
]);

// Methods that return the array they are called on.
const RETURN_THIS_METHODS = new Set(['copyWithin', 'fill', 'reverse', 'sort']);

const TS_WRAPPERS = new Set([
	'TSAsExpression',
	'TSNonNullExpression',
	'TSSatisfiesExpression',
	'TSTypeAssertion'
]);

/** Removes TS wrappers like `x as T`. */
function unwrapTS(node: TSESTree.Node): TSESTree.Node {
	let result = node;
	while (TS_WRAPPERS.has(result.type)) {
		result = (result as TSESTree.TSAsExpression).expression;
	}
	return result;
}

// Runes that return the given value itself (or the same proxy).
const PASS_THROUGH_RUNES = new Set(['$derived', '$state', '$state.raw']);

type AnyNode = TSESTree.Node | AST.SvelteNode;
type LocalFunction =
	| TSESTree.FunctionDeclaration
	| TSESTree.FunctionExpression
	| TSESTree.ArrowFunctionExpression
	| AST.SvelteSnippetBlock;

function isFunction(node: AnyNode | null | undefined): node is LocalFunction {
	return (
		node?.type === 'FunctionDeclaration' ||
		node?.type === 'FunctionExpression' ||
		node?.type === 'ArrowFunctionExpression' ||
		node?.type === 'SvelteSnippetBlock'
	);
}

function getCalleeName(callee: TSESTree.Node): string | null {
	if (callee.type === 'Identifier') return callee.name;
	if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object.type === 'Identifier' &&
		callee.property.type === 'Identifier'
	) {
		return `${callee.object.name}.${callee.property.name}`;
	}
	return null;
}

function isComponentElement(element: AnyNode | undefined): boolean {
	if (element?.type !== 'SvelteElement') return false;
	return (
		element.kind === 'component' ||
		(element.kind === 'special' &&
			(element.name.name === 'svelte:component' || element.name.name === 'svelte:self'))
	);
}

/**
 * How a followed value relates to the object of the `$state` variable.
 * - `shared`: the object itself or a part of it (e.g. `const a = v.a`).
 * - `eachItem`: an `{#each}` item. Assigning to it changes the array.
 * - `newContainer`: a new array or object whose elements are shared (e.g. `v.slice()` or `...rest`).
 */
type Mode = 'shared' | 'eachItem' | 'newContainer';

// Gives up following values when they go deeper than this, and treats them as mutated.
const MAX_DEPTH = 100;

/**
 * Checks whether the variable is mutated through one of its properties,
 * e.g. `v.a = 1`, `v.a++`, `delete v.a`, `bind:value={v.a}`, `v.push(1)` or `Object.assign(v, x)`.
 * It also follows values that point to the same object,
 * e.g. `const a = v`, `{#each v as item}`, `v.forEach((item) => ...)` or `fn(v)` for a local function.
 * `$state` makes objects deeply reactive but `$derived` does not,
 * so such a variable can't be rewritten to `$derived`.
 */
function createDeepMutationChecker(context: RuleContext) {
	const findVariableContext = new FindVariableContext(context);
	const variables = new Map<TSESTree.Identifier, Variable | null>();
	// The results that don't depend on where the check started. Kept for the whole file.
	const cache = new Map<Variable | LocalFunction, Map<Mode, boolean>>();
	// The variables and functions being checked in the current check.
	const visited = new Map<Variable | LocalFunction, Set<Mode>>();
	// The number of times a check stopped early because of `visited` or `MAX_DEPTH`.
	// A result is cached only when it didn't stop early.
	let stops = 0;
	let depth = 0;

	function findVariable(node: TSESTree.Identifier): Variable | null {
		if (!variables.has(node)) variables.set(node, findVariableContext.findVariable(node));
		return variables.get(node)!;
	}

	function withCache(key: Variable | LocalFunction, mode: Mode, check: () => boolean): boolean {
		const cached = cache.get(key)?.get(mode);
		if (cached != null) return cached;
		const visitedModes = visited.get(key) ?? new Set<Mode>();
		visited.set(key, visitedModes);
		if (visitedModes.has(mode) || depth >= MAX_DEPTH) {
			stops++;
			return depth >= MAX_DEPTH;
		}
		visitedModes.add(mode);
		const stopsBefore = stops;
		depth++;
		let result: boolean;
		try {
			result = check();
		} finally {
			depth--;
		}
		if (stops === stopsBefore) {
			const modes = cache.get(key) ?? new Map<Mode, boolean>();
			modes.set(mode, result);
			cache.set(key, modes);
		}
		return result;
	}

	/** Checks whether the variable (which gets the object or a part of it) is mutated. */
	function isVariableMutated(variable: Variable, mode: Mode): boolean {
		return withCache(variable, mode, () =>
			variable.references.some(
				(reference) =>
					// Skip the declaration itself, e.g. `{ a = 1 }` in `{#each v as { a = 1 }}`.
					!reference.init && isValueMutated(reference.identifier as TSESTree.Identifier, mode)
			)
		);
	}

	/** Checks the variables declared by the pattern, which get the object or a part of it. */
	function isPatternMutated(pattern: TSESTree.Node, mode: Mode): boolean {
		const partMode = mode === 'eachItem' ? 'eachItem' : 'shared';
		switch (pattern.type) {
			case 'Identifier': {
				const variable = findVariable(pattern);
				return variable != null && isVariableMutated(variable, mode);
			}
			case 'ObjectPattern':
				return pattern.properties.some((property) =>
					property.type === 'Property'
						? isPatternMutated(property.value, partMode)
						: isPatternMutated(property, mode)
				);
			case 'ArrayPattern':
				return pattern.elements.some(
					(element) =>
						element != null &&
						(element.type === 'RestElement'
							? isPatternMutated(element, mode)
							: isPatternMutated(element, partMode))
				);
			case 'RestElement':
				// e.g. `const [...rest] = v`
				return isPatternMutated(pattern.argument, 'newContainer');
			case 'AssignmentPattern':
				return isPatternMutated(pattern.left, mode);
			default:
				// e.g. `a.b = v`. We don't follow values stored in other objects.
				return false;
		}
	}

	/** Returns the local function (or snippet) that the given callee points to. */
	function getLocalFunction(callee: TSESTree.Node): LocalFunction | null {
		const node = unwrapTS(callee);
		if (isFunction(node)) return node;
		if (node.type !== 'Identifier') return null;
		for (const def of findVariable(node)?.defs ?? []) {
			// A TS overload signature has no body, so it's skipped.
			if (def.type === 'FunctionName' && isFunction(def.node as AnyNode)) {
				return def.node as LocalFunction;
			}
			if (def.type === 'Variable' && def.node.type === 'VariableDeclarator' && def.node.init) {
				// e.g. `const fn = ((a) => {}) as Fn`
				const init = unwrapTS(def.node.init);
				if (isFunction(init)) return init;
			}
		}
		return null;
	}

	/** Checks the parameter of a local function (or snippet) that gets the value. */
	function isParamMutated(fn: LocalFunction, index: number, mode: Mode): boolean {
		const params = (fn.params as TSESTree.Parameter[]).filter(
			// TS `this` parameter, e.g. `function f(this: T, a) {}`
			(param) => param.type !== 'Identifier' || param.name !== 'this'
		);
		for (let i = 0; i < params.length; i++) {
			const param = params[i];
			// e.g. `function f(...args) {}`. `args` is a new array that has the value.
			if (param.type === 'RestElement') return isPatternMutated(param, mode);
			if (i === index) return isPatternMutated(param, mode);
		}
		return false;
	}

	/** Checks a local function (or snippet) that gets the value as an argument, e.g. `fn(v)`. */
	function isPassedToMutatingFunction(
		call: TSESTree.CallExpression,
		index: number,
		mode: Mode
	): boolean {
		if (call.arguments.slice(0, index).some((arg) => arg.type === 'SpreadElement')) return false;
		const fn = getLocalFunction(call.callee);
		return fn != null && isParamMutated(fn, index, mode);
	}

	/** Checks the callbacks of a method call on the object, e.g. `v.forEach((item) => ...)`. */
	function isMutatedInCallbacks(call: TSESTree.CallExpression, method: string | null): boolean {
		return call.arguments.some((arg) => {
			const fn = getLocalFunction(arg);
			if (!fn) return false;
			const indexes =
				method != null && REDUCE_METHODS.has(method) && call.arguments.length >= 2
					? [1, 3]
					: fn.params.map((_, i) => i);
			return indexes.some((index) => isParamMutated(fn, index, 'shared'));
		});
	}

	/** Checks whether the node is the getter of a function binding on a component. */
	function isComponentGetterBinding(parent: AnyNode | null | undefined, node: AnyNode): boolean {
		if ((parent?.type as string) !== 'SvelteFunctionBindingsExpression') return false;
		const bindings = parent as unknown as TSESTree.SequenceExpression;
		const directive = bindings.parent as AnyNode | undefined;
		return (
			bindings.expressions[0] === node &&
			directive?.type === 'SvelteDirective' &&
			directive.kind === 'Binding' &&
			isComponentElement(directive.parent?.parent)
		);
	}

	/**
	 * Checks the values returned by the function, e.g. `get().a = 1` for `const get = () => v`.
	 */
	function isReturnedValueMutated(fn: LocalFunction, mode: Mode): boolean {
		if (fn.type === 'SvelteSnippetBlock') return false;
		const parent = fn.parent as AnyNode;
		if (parent.type === 'CallExpression') {
			// e.g. `(() => v)()` or `$derived.by(() => v)`
			if (
				parent.callee === fn ||
				(parent.arguments[0] === fn && getCalleeName(parent.callee) === '$derived.by')
			) {
				return isValueMutated(parent, mode);
			}
			return false;
		}
		// e.g. `<Child bind:value={() => v, (x) => (v = x)} />`
		if (isComponentGetterBinding(parent, fn)) return true;
		let id: TSESTree.Identifier | null = null;
		if (fn.type === 'FunctionDeclaration') id = fn.id;
		else {
			// e.g. `const get = (() => v) as Getter`
			let declarator: AnyNode = parent;
			while (TS_WRAPPERS.has(declarator.type)) declarator = declarator.parent as AnyNode;
			if (declarator.type === 'VariableDeclarator' && declarator.id.type === 'Identifier') {
				id = declarator.id;
			}
		}
		const variable = id && findVariable(id);
		if (!variable) return false;
		return withCache(fn, mode, () =>
			variable.references.some((reference) => {
				const call = reference.identifier.parent;
				// e.g. `<Child bind:value={get, set} />`
				if (isComponentGetterBinding(call, reference.identifier)) return true;
				return (
					call?.type === 'CallExpression' &&
					// e.g. `get()` or `$derived.by(get)`
					(call.callee === reference.identifier ||
						(call.arguments[0] === reference.identifier &&
							getCalleeName(call.callee) === '$derived.by')) &&
					isValueMutated(call, mode)
				);
			})
		);
	}

	/**
	 * Checks whether the value of the given expression (the object or a part of it) is mutated.
	 */
	function isValueMutated(expression: TSESTree.Node, mode: Mode): boolean {
		let node: TSESTree.Node = expression;
		// Whether `node` is a part of the object (e.g. `v.a`) rather than the value itself.
		let isMember = mode === 'newContainer';
		let property: string | null = null;
		// The number of member accesses after a new container (e.g. `v.filter(f)`).
		// When it is `0`, `node` is the new container, and when it is `1`, `node` is its property.
		// Changing them is not a mutation of the object.
		let newContainerMembers: number | null = mode === 'newContainer' ? 0 : null;

		/** Whether `node` is shared with the object, so changing it mutates the object. */
		function isShared() {
			return isMember && (newContainerMembers == null || newContainerMembers >= 2);
		}

		/** Whether assigning to `node` mutates the object. */
		function isWrite() {
			return isShared() || (mode === 'eachItem' && !isMember);
		}

		/** The mode of a value that gets `node`. */
		function getMode(): Mode {
			return isMember && newContainerMembers === 0 ? 'newContainer' : 'shared';
		}

		while (node.parent) {
			const parent = node.parent as AnyNode;
			switch (parent.type) {
				case 'TSNonNullExpression':
				case 'TSAsExpression':
				case 'TSSatisfiesExpression':
				case 'TSTypeAssertion':
				case 'TSInstantiationExpression':
				case 'ChainExpression':
				case 'AwaitExpression':
					node = parent;
					continue;
				case 'LogicalExpression':
				case 'ConditionalExpression':
					if (parent.type === 'ConditionalExpression' && parent.test === node) return false;
					// e.g. `(v || x).a = 1`
					node = parent;
					continue;
				case 'SequenceExpression':
					if (parent.expressions[parent.expressions.length - 1] !== node) return false;
					node = parent;
					continue;
				case 'SpreadElement': {
					const container = parent.parent as AnyNode;
					if (container.type === 'ArrayExpression' || container.type === 'ObjectExpression') {
						// e.g. `[...v]` or `{ ...v }`. A new container whose elements are shared.
						node = container as TSESTree.Node;
						isMember = true;
						newContainerMembers = 0;
						property = null;
						continue;
					}
					if (container.type === 'CallExpression') {
						// e.g. `fn(...v)`. The parameters from there get the elements.
						const index = container.arguments.indexOf(parent);
						if (container.arguments.slice(0, index).some((arg) => arg.type === 'SpreadElement')) {
							return false;
						}
						const fn = getLocalFunction(container.callee);
						return (
							fn != null && fn.params.some((_, i) => i >= index && isParamMutated(fn, i, 'shared'))
						);
					}
					return false;
				}
				case 'MemberExpression':
					if (parent.object !== node) return false;
					node = parent;
					isMember = true;
					if (newContainerMembers != null) newContainerMembers++;
					property = getPropertyName(parent, getScope(context, parent));
					continue;
				case 'CallExpression': {
					if (parent.callee === node) {
						if (!isMember) return false;
						// e.g. `v.push(1)`
						if (property != null && MUTATING_METHODS.has(property) && isShared()) return true;
						// e.g. `v.forEach((item) => (item.a = 1))`
						if (isMutatedInCallbacks(parent, property)) return true;
						// The returned value may be a part of the object, e.g. `v.find(...).a = 1`.
						// `[...v].sort()` returns the new array itself. Results of other methods may be shared.
						newContainerMembers =
							property != null &&
							(NEW_ARRAY_METHODS.has(property) ||
								(RETURN_THIS_METHODS.has(property) && newContainerMembers === 1))
								? 0
								: null;
						node = parent;
						property = null;
						continue;
					}
					const index = parent.arguments.indexOf(node as TSESTree.CallExpressionArgument);
					const calleeName = getCalleeName(parent.callee);
					if (calleeName != null && PASS_THROUGH_RUNES.has(calleeName) && index === 0) {
						// e.g. `const a = $derived(v)`
						node = parent;
						continue;
					}
					if (
						parent.callee.type === 'MemberExpression' &&
						calleeName != null &&
						index === 0 &&
						getMode() === 'shared'
					) {
						const [object, method] = calleeName.split('.');
						// e.g. `Object.assign(v, x)`
						if (MUTATING_STATIC_METHODS.get(object)?.has(method)) return true;
					}
					// e.g. `fn(v)` or `{@render snippet(v)}`
					return isPassedToMutatingFunction(parent, index, getMode());
				}
				case 'ReturnStatement':
				case 'ArrowFunctionExpression': {
					if (parent.type === 'ArrowFunctionExpression' && parent.body !== node) return false;
					// e.g. `$derived.by(() => v)` or `const get = () => v`
					let fn: AnyNode | undefined = parent;
					while (fn && !isFunction(fn)) {
						fn = fn.parent as AnyNode | undefined;
					}
					return isFunction(fn) && isReturnedValueMutated(fn, getMode());
				}
				case 'AssignmentExpression':
					if (parent.left === node) return isWrite();
					// e.g. `a = v`
					if (isPatternMutated(parent.left, getMode())) return true;
					node = parent;
					continue;
				case 'UpdateExpression':
					return isWrite();
				case 'UnaryExpression':
					return parent.operator === 'delete' && isShared();
				case 'VariableDeclarator':
					// e.g. `const a = v`
					return parent.init === node && isPatternMutated(parent.id, getMode());
				case 'Property':
					// e.g. `({ a: v.a } = x)`
					if (parent.parent?.type !== 'ObjectPattern') return false;
					return parent.value === node && isWrite();
				case 'ArrayPattern':
				case 'RestElement':
					// e.g. `[v.a] = x`
					return isWrite();
				case 'AssignmentPattern':
					if (parent.left === node) return isWrite();
					// e.g. `const { a = v } = x`
					return isPatternMutated(parent.left, getMode());
				case 'ForOfStatement':
				case 'ForInStatement':
					if (parent.left === node) return isWrite();
					if (parent.type === 'ForInStatement') return false;
					// e.g. `for (const item of v)`
					return isPatternMutated(
						parent.left.type === 'VariableDeclaration'
							? parent.left.declarations[0].id
							: parent.left,
						'shared'
					);
				case 'SvelteEachBlock':
					// e.g. `{#each v as item}`
					return (
						parent.expression === node &&
						parent.context != null &&
						isPatternMutated(parent.context, 'eachItem')
					);
				case 'SvelteDirective':
					if (parent.kind === 'Action') {
						// e.g. `use:action={v}`
						const name = parent.key.name;
						const fn =
							parent.expression === node && name.type === 'Identifier'
								? getLocalFunction(name)
								: null;
						return fn != null && isParamMutated(fn, 1, getMode());
					}
					if (parent.kind !== 'Binding') return false;
					if (isWrite()) return true;
					// e.g. `<Child bind:value={v} />` that may mutate it. `bind:this` never does.
					return (
						isComponentElement(parent.parent?.parent) &&
						(parent.key.name as { name?: unknown }).name !== 'this'
					);
				default:
					return false;
			}
		}
		return false;
	}

	return (variable: Variable) => {
		visited.clear();
		stops = 0;
		depth = 0;
		return isVariableMutated(variable, 'shared');
	};
}

export default createRule('prefer-writable-derived', {
	meta: {
		docs: {
			description: 'Prefer using writable $derived instead of $state and $effect',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: 'Prefer using writable $derived instead of $state and $effect',
			suggestRewrite: 'Rewrite $state and $effect to $derived'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		],
		hasSuggestions: true
	},
	create(context) {
		if (!shouldRun) {
			return {};
		}
		const isDeeplyMutated = createDeepMutationChecker(context);
		return {
			CallExpression: (node: TSESTree.CallExpression) => {
				if (!isEffectOrEffectPre(node) || node.arguments.length !== 1) {
					return;
				}

				const argument = node.arguments[0];
				if (!isValidFunctionArgument(argument)) {
					return;
				}

				const statement = argument.body.body[0];
				if (!isValidAssignment(statement)) {
					return;
				}

				const { left, right } = statement.expression;
				const scope = getScope(context, statement);
				const reference = scope.references.find(
					(ref) => ref.identifier.type === 'Identifier' && ref.identifier.name === left.name
				);

				const def = reference?.resolved?.defs?.[0];
				if (!def || def.type !== 'Variable' || def.node.type !== 'VariableDeclarator') {
					return;
				}

				const { init } = def.node;
				if (!isStateVariable(init)) {
					return;
				}

				if (isDeeplyMutated(reference.resolved!)) {
					return;
				}

				context.report({
					node: def.node,
					messageId: 'unexpected',
					suggest: [
						{
							messageId: 'suggestRewrite',
							fix: (fixer) => {
								const rightCode = context.sourceCode.getText(right);
								return [fixer.replaceText(init, `$derived(${rightCode})`), fixer.remove(node)];
							}
						}
					]
				});
			}
		};
	}
});
