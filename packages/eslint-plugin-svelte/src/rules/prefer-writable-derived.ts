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
// Map / Set methods are included too, since a custom class may have methods with these names.
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
const MUTATING_STATIC_METHODS: Record<string, Set<string>> = {
	Object: new Set(['assign', 'defineProperties', 'defineProperty', 'setPrototypeOf']),
	Reflect: new Set(['defineProperty', 'deleteProperty', 'set', 'setPrototypeOf'])
};

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
	'with'
]);

// Runes that return the given value itself (or the same proxy).
const PASS_THROUGH_RUNES = new Set(['$derived', '$state', '$state.raw']);

type AnyNode = TSESTree.Node | AST.SvelteNode;

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
 * Checks whether the variable is mutated through one of its properties,
 * e.g. `v.a = 1`, `v.a++`, `delete v.a`, `bind:value={v.a}`, `v.push(1)` or `Object.assign(v, x)`.
 * It also follows values that point to the same object,
 * e.g. `const a = v`, `{#each v as item}`, `v.forEach((item) => ...)` or `fn(v)` for a local function.
 * `$state` makes objects deeply reactive but `$derived` does not,
 * so such a variable can't be rewritten to `$derived`.
 */
function createDeepMutationChecker(context: RuleContext) {
	const visited = new Set<Variable>();
	const findVariableContext = new FindVariableContext(context);
	const variables = new Map<TSESTree.Identifier, Variable | null>();

	function findVariable(node: TSESTree.Identifier): Variable | null {
		if (!variables.has(node)) variables.set(node, findVariableContext.findVariable(node));
		return variables.get(node)!;
	}

	/**
	 * Checks whether the variable (which points to the object or to a part of it) is mutated.
	 * `isEachItem` is `true` for an `{#each}` item, since assigning to it changes the array.
	 */
	function isVariableMutated(variable: Variable, isEachItem: boolean): boolean {
		if (visited.has(variable)) return false;
		visited.add(variable);
		return variable.references.some((reference) =>
			isValueMutated(reference.identifier as TSESTree.Identifier, isEachItem)
		);
	}

	/** Checks the variables declared by the pattern, which get the object or a part of it. */
	function isPatternMutated(pattern: TSESTree.Node, isEachItem: boolean): boolean {
		switch (pattern.type) {
			case 'Identifier': {
				const variable = findVariable(pattern);
				return variable != null && isVariableMutated(variable, isEachItem);
			}
			case 'ObjectPattern':
				return pattern.properties.some((property) =>
					isPatternMutated(property.type === 'Property' ? property.value : property, isEachItem)
				);
			case 'ArrayPattern':
				return pattern.elements.some(
					(element) => element != null && isPatternMutated(element, isEachItem)
				);
			case 'RestElement':
				return isPatternMutated(pattern.argument, isEachItem);
			case 'AssignmentPattern':
				return isPatternMutated(pattern.left, isEachItem);
			case 'MemberExpression':
				// e.g. `a.b = v`. We don't follow values stored in other objects.
				return false;
			default:
				return false;
		}
	}

	/** Checks the parameters of a local function or snippet that gets the value as an argument. */
	function isPassedToMutatingFunction(call: TSESTree.CallExpression, index: number): boolean {
		if (call.callee.type !== 'Identifier') return false;
		if (call.arguments.slice(0, index).some((arg) => arg.type === 'SpreadElement')) return false;
		const def = findVariable(call.callee)?.defs[0];
		if (!def) return false;
		let fn: AnyNode | null = null;
		if (def.type === 'FunctionName') {
			fn = def.node as AnyNode;
		} else if (def.type === 'Variable' && def.node.type === 'VariableDeclarator') {
			fn = def.node.init;
		}
		if (
			fn?.type !== 'FunctionDeclaration' &&
			fn?.type !== 'FunctionExpression' &&
			fn?.type !== 'ArrowFunctionExpression' &&
			fn?.type !== 'SvelteSnippetBlock'
		) {
			return false;
		}
		const params = fn.params as TSESTree.Parameter[];
		for (let i = 0; i < params.length; i++) {
			const param = params[i];
			if (param.type === 'RestElement') return isPatternMutated(param, false);
			if (i === index) return isPatternMutated(param, false);
		}
		return false;
	}

	/**
	 * Checks whether the value of the given expression (the object or a part of it) is mutated.
	 */
	function isValueMutated(expression: TSESTree.Node, isEachItem: boolean): boolean {
		let node: TSESTree.Node = expression;
		// Whether `node` is a part of the object (e.g. `v.a`) rather than the variable itself.
		let isMember = false;
		let property: string | null = null;
		// The number of member accesses after a method that returns a new array (e.g. `v.filter(f)`).
		// When it is `1`, `node` is a property of the new array, so changing it is not a mutation of `v`.
		let newArrayMembers: number | null = null;

		function isShared() {
			return isMember && newArrayMembers !== 1;
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
				case 'MemberExpression':
					if (parent.object !== node) return false;
					node = parent;
					isMember = true;
					if (newArrayMembers != null) newArrayMembers++;
					property = getPropertyName(parent, getScope(context, parent));
					continue;
				case 'CallExpression': {
					if (parent.callee === node) {
						if (!isMember) return false;
						// e.g. `v.push(1)`
						if (property != null && MUTATING_METHODS.has(property) && isShared()) return true;
						// e.g. `v.forEach((item) => (item.a = 1))`
						for (const arg of parent.arguments) {
							if (
								(arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression') &&
								arg.params.some((param) => isPatternMutated(param, false))
							) {
								return true;
							}
						}
						// The returned value may be a part of the object, e.g. `v.find(...).a = 1`.
						newArrayMembers = property != null && NEW_ARRAY_METHODS.has(property) ? 0 : null;
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
					if (parent.callee.type === 'MemberExpression' && calleeName != null && index === 0) {
						const [object, method] = calleeName.split('.');
						// e.g. `Object.assign(v, x)`
						if (MUTATING_STATIC_METHODS[object]?.has(method)) return true;
					}
					// e.g. `fn(v)` or `{@render snippet(v)}`
					return isPassedToMutatingFunction(parent, index);
				}
				case 'ReturnStatement':
				case 'ArrowFunctionExpression': {
					if (parent.type === 'ArrowFunctionExpression' && parent.body !== node) return false;
					// e.g. `$derived.by(() => v)`
					let fn: AnyNode | undefined = parent;
					while (
						fn &&
						fn.type !== 'ArrowFunctionExpression' &&
						fn.type !== 'FunctionExpression' &&
						fn.type !== 'FunctionDeclaration'
					) {
						fn = fn.parent as AnyNode | undefined;
					}
					const call = fn?.parent;
					if (
						call?.type === 'CallExpression' &&
						call.arguments[0] === fn &&
						getCalleeName(call.callee) === '$derived.by'
					) {
						node = call;
						continue;
					}
					return false;
				}
				case 'AssignmentExpression':
					if (parent.left === node) return isShared() || isEachItem;
					// e.g. `a = v`
					if (isPatternMutated(parent.left, false)) return true;
					node = parent;
					continue;
				case 'UpdateExpression':
					return isShared() || isEachItem;
				case 'UnaryExpression':
					return parent.operator === 'delete' && isShared();
				case 'VariableDeclarator':
					// e.g. `const a = v`
					return parent.init === node && isPatternMutated(parent.id, false);
				case 'Property':
					// e.g. `({ a: v.a } = x)`
					if (parent.parent?.type !== 'ObjectPattern') return false;
					return parent.value === node && (isShared() || isEachItem);
				case 'ArrayPattern':
				case 'RestElement':
					// e.g. `[v.a] = x`
					return isShared() || isEachItem;
				case 'AssignmentPattern':
					if (parent.left === node) return isShared() || isEachItem;
					// e.g. `const { a = v } = x`
					return isPatternMutated(parent.left, false);
				case 'ForOfStatement':
				case 'ForInStatement':
					if (parent.left === node) return isShared() || isEachItem;
					if (parent.type === 'ForInStatement') return false;
					// e.g. `for (const item of v)`
					return isPatternMutated(
						parent.left.type === 'VariableDeclaration'
							? parent.left.declarations[0].id
							: parent.left,
						false
					);
				case 'SvelteEachBlock':
					// e.g. `{#each v as item}`
					return (
						parent.expression === node &&
						parent.context != null &&
						isPatternMutated(parent.context, true)
					);
				case 'SvelteDirective':
					if (parent.kind !== 'Binding') return false;
					// e.g. `bind:value={v.a}`, or `<Child bind:value={v} />` that may mutate it.
					return isShared() || isEachItem || isComponentElement(parent.parent?.parent);
				default:
					return false;
			}
		}
		return false;
	}

	return (variable: Variable) => isVariableMutated(variable, false);
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

				if (createDeepMutationChecker(context)(reference.resolved!)) {
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
