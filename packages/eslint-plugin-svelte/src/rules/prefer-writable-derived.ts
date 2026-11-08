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
		argument.params.length !== 0 ||
		// e.g. `$effect(async () => { v = await f() })`. `$derived(await f())` needs experimental async.
		argument.async ||
		argument.generator
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

type AnyNode = TSESTree.Node | AST.SvelteNode;
type InlineFunction = TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;

// `$state` makes only arrays and plain objects deeply reactive
// (https://svelte.dev/docs/svelte/$state#Deep-state), and the rule assumes that the object is data.
// So a method called on a part of the object is a built-in method. These are classified by the spec.
// The others (e.g. `push`) may change the object.

// Methods whose results don't share anything with the object.
const READ_METHODS = new Set([
	// Array.prototype
	'every',
	'findIndex',
	'findLastIndex',
	'forEach',
	'includes',
	'indexOf',
	'join',
	'keys',
	'lastIndexOf',
	'some',
	'toLocaleString',
	'toString',
	// Object.prototype
	'hasOwnProperty',
	'isPrototypeOf',
	'propertyIsEnumerable',
	// String.prototype
	'charAt',
	'charCodeAt',
	'codePointAt',
	'endsWith',
	'isWellFormed',
	'localeCompare',
	'match',
	'matchAll',
	'normalize',
	'padEnd',
	'padStart',
	'repeat',
	'replace',
	'replaceAll',
	'search',
	'split',
	'startsWith',
	'substr',
	'substring',
	'toLocaleLowerCase',
	'toLocaleUpperCase',
	'toLowerCase',
	'toUpperCase',
	'toWellFormed',
	'trim',
	'trimEnd',
	'trimStart',
	// Number.prototype
	'toExponential',
	'toFixed',
	'toPrecision',
	// Date.prototype (`$state` doesn't proxy class instances)
	'getDate',
	'getDay',
	'getFullYear',
	'getHours',
	'getMilliseconds',
	'getMinutes',
	'getMonth',
	'getSeconds',
	'getTime',
	'getTimezoneOffset',
	'getUTCDate',
	'getUTCDay',
	'getUTCFullYear',
	'getUTCHours',
	'getUTCMilliseconds',
	'getUTCMinutes',
	'getUTCMonth',
	'getUTCSeconds',
	'toDateString',
	'toISOString',
	'toJSON',
	'toLocaleDateString',
	'toLocaleTimeString',
	'toTimeString',
	'toUTCString'
]);

// Array methods whose results share parts of the object, e.g. `v.filter(f)` or `v.slice()`.
const SHARING_METHODS = new Set([
	'at',
	'concat',
	'entries',
	'filter',
	'find',
	'findLast',
	'flat',
	'flatMap',
	'map',
	'reduce',
	'reduceRight',
	'slice',
	'toReversed',
	'toSorted',
	'toSpliced',
	'values',
	'valueOf',
	'with'
]);

// Array methods that call the first argument with the elements.
const CALLBACK_METHODS = new Set([
	'every',
	'filter',
	'find',
	'findIndex',
	'findLast',
	'findLastIndex',
	'flatMap',
	'forEach',
	'map',
	'reduce',
	'reduceRight',
	'some',
	'toSorted'
]);

// Global functions that return primitives and don't change their arguments.
const PRIMITIVE_GLOBAL_FUNCTIONS = new Set([
	'Array.isArray',
	'BigInt',
	'Boolean',
	'Number',
	'Number.isFinite',
	'Number.isInteger',
	'Number.isNaN',
	'Number.isSafeInteger',
	'Number.parseFloat',
	'Number.parseInt',
	'Object.hasOwn',
	'Object.is',
	'Object.isExtensible',
	'Object.isFrozen',
	'Object.isSealed',
	'String',
	'decodeURI',
	'decodeURIComponent',
	'encodeURI',
	'encodeURIComponent',
	'isFinite',
	'isNaN',
	'parseFloat',
	'parseInt'
]);

// Global functions that don't change their arguments and return something not shared with them.
const READ_GLOBAL_FUNCTIONS = new Set([
	...PRIMITIVE_GLOBAL_FUNCTIONS,
	'$state.snapshot',
	'Object.getOwnPropertyNames',
	'Object.keys',
	'structuredClone'
]);

// Global objects whose methods don't change their arguments and don't return them.
const READ_GLOBAL_OBJECTS = new Set(['Math', 'console']);

// Global functions (and runes) whose results share their arguments.
const SHARING_GLOBAL_FUNCTIONS = new Set([
	'$derived',
	'$state',
	'$state.raw',
	'Array.of',
	'Object.entries',
	'Object.values'
]);

const TS_WRAPPERS = new Set([
	'TSAsExpression',
	'TSInstantiationExpression',
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

function isInlineFunction(node: AnyNode | null | undefined): node is InlineFunction {
	return node?.type === 'FunctionExpression' || node?.type === 'ArrowFunctionExpression';
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

/** Checks whether the node is a target of an assignment, e.g. `a.b` in `a.b = 1` or `[a.b] = x`. */
function isWriteTarget(target: TSESTree.Node): boolean {
	// e.g. `v.a! = 1` or `(v.a as T)++`
	let node = target;
	while (node.parent && TS_WRAPPERS.has(node.parent.type)) node = node.parent;
	const parent = node.parent as AnyNode | null;
	switch (parent?.type) {
		case 'AssignmentExpression':
		case 'AssignmentPattern':
		case 'ForInStatement':
		case 'ForOfStatement':
			return parent.left === node;
		case 'ArrayPattern':
		case 'RestElement':
		case 'UpdateExpression':
			return true;
		case 'Property':
			return parent.parent?.type === 'ObjectPattern' && parent.value === node;
		case 'UnaryExpression':
			return parent.operator === 'delete';
		default:
			return false;
	}
}

/** Returns the outermost pattern that has the given pattern, e.g. `{ a = 1 }` for `a`. */
function getRootPattern(pattern: TSESTree.Node): TSESTree.Node {
	let node = pattern;
	while (
		node.parent?.type === 'Property' ||
		node.parent?.type === 'ObjectPattern' ||
		node.parent?.type === 'ArrayPattern' ||
		node.parent?.type === 'AssignmentPattern' ||
		node.parent?.type === 'RestElement'
	) {
		node = node.parent;
	}
	return node;
}

/** Checks whether the pattern is in the destructuring of `$props()`. */
function isPropsPattern(pattern: TSESTree.Node): boolean {
	const root = getRootPattern(pattern);
	const declarator = root.parent;
	if (declarator?.type !== 'VariableDeclarator' || declarator.id !== root || !declarator.init) {
		return false;
	}
	const init = unwrapTS(declarator.init);
	return (
		init.type === 'CallExpression' &&
		init.callee.type === 'Identifier' &&
		init.callee.name === '$props'
	);
}

function isOptionElement(node: AnyNode | null | undefined): boolean {
	return node?.type === 'SvelteElement' && node.kind === 'html' && node.name.name === 'option';
}

/**
 * Checks whether an attribute may give its value to code that can change it.
 * Components, custom elements and `<slot>` may give it back (e.g. through a callback or a binding).
 * `value` of `<input>` and `<option>` is given back by `bind:value` and `bind:group`.
 */
function isAttributeEscaping(attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute) {
	const element = attribute.parent.parent;
	if (element.type !== 'SvelteElement' || element.kind !== 'html') return true;
	if (element.name.name === 'slot' || element.name.name.includes('-')) return true;
	if (
		element.startTag.attributes.some(
			(attr) => attr.type === 'SvelteAttribute' && attr.key.name === 'is'
		)
	) {
		return true;
	}
	return attribute.key.name === 'value';
}

/**
 * Checks whether the object of the `$state` variable may be mutated, e.g. `v.a = 1`, `v.push(1)`,
 * `bind:value={v.a}` or passing it to a function that may change it.
 * It follows values that share the object or a part of it, e.g. `const a = v.a`,
 * `{#each v as item}`, `v.filter((item) => ...)` or `[...v]`.
 * Any other use is treated as a mutation.
 */
function createMutationChecker(context: RuleContext) {
	const findVariableContext = new FindVariableContext(context);
	// The variables being checked. A variable found again is checked by the first visit.
	const visited = new Set<Variable>();
	// `{#each}` items. Assigning to them changes the array.
	const eachItems = new Set<Variable>();

	function findVariable(node: TSESTree.Identifier): Variable | null {
		return findVariableContext.findVariable(node);
	}

	/** Returns the name of the global function or rune, e.g. `JSON.stringify` or `$state.snapshot`. */
	function getGlobalName(callee: TSESTree.Node): string | null {
		const node = unwrapTS(callee);
		const name = getCalleeName(node);
		if (name == null) return null;
		const root = (node.type === 'MemberExpression' ? node.object : node) as TSESTree.Identifier;
		const variable = findVariable(root);
		return variable == null || variable.defs.length === 0 ? name : null;
	}

	/** Checks whether the function uses `arguments`, which has all arguments. */
	function usesArguments(fn: InlineFunction): boolean {
		if (fn.type !== 'FunctionExpression') return false;
		const scope = context.sourceCode.scopeManager?.acquire(fn);
		if (!scope) return true;
		return (
			(scope.set.get('arguments')?.references.length ?? 0) > 0 ||
			// e.g. `function (a, g = () => arguments[0]) {}`. The reference is not resolved.
			scope.through.some((reference) => reference.identifier.name === 'arguments')
		);
	}

	/**
	 * Checks a variable that gets the object or a part of it.
	 * `callback` is set when the variable is a parameter of a callback of a built-in method,
	 * which gets the elements from the method.
	 */
	function isVariableMutated(variable: Variable, callback: InlineFunction | null): boolean {
		if (visited.has(variable)) return false;
		visited.add(variable);
		return (
			// e.g. `window.a` set by `a = v`
			variable.defs.length === 0 ||
			variable.defs.some(
				(def) =>
					// e.g. `export let a = v.a`. Other files may use it.
					def.node.parent?.parent?.type === 'ExportNamedDeclaration' ||
					def.node.parent?.type === 'ExportNamedDeclaration' ||
					// e.g. `picked = v` with `let { picked } = $props()`. A custom element exposes it.
					isPropsPattern(def.name) ||
					// e.g. `item = v` for a parameter. It may be returned to a built-in method.
					// (`{#each}` items are parameters of the block, too.)
					(def.type === 'Parameter' &&
						def.node.type !== ('SvelteEachBlock' as string) &&
						def.node !== callback)
			) ||
			variable.references.some((reference) => {
				if (reference.init) return false;
				if (reference.isWrite()) {
					// e.g. `item = 1` in `{#each v as item}` changes the array.
					if (eachItems.has(variable)) return true;
					// e.g. `a = x`. Reassigning doesn't change the object.
					if (!reference.isRead()) return false;
				}
				return isUseMutated(reference.identifier as TSESTree.Identifier, callback);
			})
		);
	}

	/** Checks a pattern that gets the object or a part of it, e.g. `{ a }` in `const { a } = v`. */
	function isPatternMutated(
		pattern: TSESTree.Node,
		callback: InlineFunction | null,
		isEachItem = false
	): boolean {
		switch (pattern.type) {
			case 'Identifier': {
				const variable = findVariable(pattern);
				if (variable == null) return true;
				if (isEachItem) eachItems.add(variable);
				return isVariableMutated(variable, callback);
			}
			case 'ObjectPattern':
				return pattern.properties.some((property) =>
					isPatternMutated(
						property.type === 'Property' ? property.value : property.argument,
						callback,
						isEachItem
					)
				);
			case 'ArrayPattern':
				return pattern.elements.some(
					(element) => element != null && isPatternMutated(element, callback, isEachItem)
				);
			case 'RestElement':
				return isPatternMutated(pattern.argument, callback, isEachItem);
			case 'AssignmentPattern':
				return isPatternMutated(pattern.left, callback, isEachItem);
			default:
				// e.g. `[a.b] = [v]` stores it in another object.
				return true;
		}
	}

	/** Checks `v.method(...)`. */
	function isMethodCallMutated(
		call: TSESTree.CallExpression,
		member: TSESTree.MemberExpression,
		callback: InlineFunction | null
	): boolean {
		const name = getPropertyName(member, getScope(context, member));
		if (name == null) return true;
		const first = call.arguments[0];
		if (CALLBACK_METHODS.has(name) && first) {
			const fn = unwrapTS(first);
			if (isInlineFunction(fn)) {
				// e.g. `v.forEach((item) => ...)`. The parameters get the elements.
				if (
					fn.async ||
					fn.generator ||
					usesArguments(fn) ||
					fn.params.some((param) => isPatternMutated(param, fn))
				) {
					return true;
				}
			} else {
				// e.g. `v.filter(Boolean)`
				const fnName = getGlobalName(fn);
				if (fnName == null || !PRIMITIVE_GLOBAL_FUNCTIONS.has(fnName)) return true;
			}
		}
		if (READ_METHODS.has(name)) return false;
		if (SHARING_METHODS.has(name)) return isUseMutated(call, callback);
		return true;
	}

	/** Checks `fn(v)`. */
	function isArgumentMutated(
		call: TSESTree.CallExpression,
		node: TSESTree.Node,
		callback: InlineFunction | null
	): boolean {
		const name = getGlobalName(call.callee);
		if (name == null) return true;
		if (name === 'JSON.stringify') {
			// e.g. `JSON.stringify(v, (key, value) => ...)`. The replacer gets parts of the value.
			const replacer = call.arguments[1] && unwrapTS(call.arguments[1]);
			return (
				call.arguments[0] !== node ||
				(replacer != null &&
					replacer.type !== 'ArrayExpression' &&
					!(replacer.type === 'Literal' && replacer.value === null))
			);
		}
		if (READ_GLOBAL_FUNCTIONS.has(name)) return false;
		const [object, method] = name.split('.');
		if (method != null && READ_GLOBAL_OBJECTS.has(object)) return false;
		// e.g. `$inspect(v).with(callback)`. The callback gets the value.
		if (name === '$inspect') return call.parent?.type === 'MemberExpression';
		if (
			SHARING_GLOBAL_FUNCTIONS.has(name) ||
			// `Array.from(v, fn)` calls `fn` with the elements.
			(name === 'Array.from' && call.arguments.length === 1)
		) {
			return isUseMutated(call, callback);
		}
		return true;
	}

	/** Checks `return v` or `() => v`. */
	function isReturnMutated(node: AnyNode, callback: InlineFunction | null): boolean {
		let fn: AnyNode | null = node;
		while (fn && !isInlineFunction(fn) && fn.type !== 'FunctionDeclaration') {
			fn = fn.parent as AnyNode | null;
		}
		// e.g. `v.map((item) => item.a)`. The built-in method gets it, and its result is checked.
		if (fn != null && fn === callback) return false;
		// e.g. `$derived.by(() => v.a)`
		const call = fn?.parent;
		if (
			isInlineFunction(fn) &&
			call?.type === 'CallExpression' &&
			call.arguments[0] === fn &&
			getGlobalName(call.callee) === '$derived.by'
		) {
			return isUseMutated(call, callback);
		}
		return true;
	}

	/**
	 * Checks what is done with an expression that has the object or a part of it.
	 * `callback` is the callback whose parameter the expression comes from.
	 */
	function isUseMutated(expression: TSESTree.Node, callback: InlineFunction | null): boolean {
		let node: TSESTree.Node = expression;
		for (;;) {
			const parent = node.parent as AnyNode | null;
			if (!parent) return true;
			switch (parent.type) {
				case 'TSAsExpression':
				case 'TSInstantiationExpression':
				case 'TSNonNullExpression':
				case 'TSSatisfiesExpression':
				case 'TSTypeAssertion':
				case 'ChainExpression':
				case 'AwaitExpression':
				case 'LogicalExpression':
				case 'ArrayExpression':
					// e.g. `v ?? x` or `[v]`. The result has it.
					node = parent;
					continue;
				case 'ConditionalExpression':
					if (parent.test === node) return false;
					node = parent;
					continue;
				case 'SequenceExpression':
					if (parent.expressions[parent.expressions.length - 1] !== node) return false;
					node = parent;
					continue;
				case 'SpreadElement':
					// e.g. `[...v]`. Spreading into calls or objects is not followed.
					if (parent.parent?.type !== 'ArrayExpression') return true;
					node = parent.parent;
					continue;
				case 'MemberExpression': {
					// e.g. `x[v.id]`
					if (parent.object !== node) return false;
					// e.g. `v.a = 1`, `v.a++` or `delete v.a`
					if (isWriteTarget(parent)) return true;
					const call = parent.parent;
					if (call?.type === 'CallExpression' && call.callee === parent) {
						return isMethodCallMutated(call, parent, callback);
					}
					node = parent;
					continue;
				}
				case 'CallExpression':
					// e.g. `v.fn()`
					if (parent.callee === node) return true;
					return isArgumentMutated(parent, node, callback);
				case 'BinaryExpression': {
					// e.g. `v instanceof C` passes it to `C[Symbol.hasInstance]`.
					// Global classes use the built-in one.
					if (parent.operator !== 'instanceof' || parent.right === node) return false;
					const right = unwrapTS(parent.right);
					return right.type !== 'Identifier' || getGlobalName(right) == null;
				}
				case 'UnaryExpression':
					return parent.operator === 'delete';
				case 'UpdateExpression':
					// e.g. `a++`. It makes a number.
					return unwrapTS(node).type !== 'Identifier';
				case 'AssignmentExpression':
					if (parent.left === node) {
						// e.g. `(a as T) = 1` is a write to a part only when it isn't a variable.
						if (unwrapTS(node).type !== 'Identifier') return true;
						// e.g. `a += 1`
						if (!['||=', '&&=', '??='].includes(parent.operator)) return false;
						node = parent;
						continue;
					}
					if (!['=', '||=', '&&=', '??='].includes(parent.operator)) return false;
					// e.g. `a = v`. The result has it, too.
					if (isPatternMutated(parent.left, null)) return true;
					node = parent;
					continue;
				case 'AssignmentPattern': {
					if (parent.right !== node) return true;
					// e.g. `const { a = v } = x`. Defaults of parameters and `$props()` are not followed.
					const root = getRootPattern(parent);
					if (root.parent?.type !== 'VariableDeclarator' || isPropsPattern(root)) return true;
					return isPatternMutated(parent.left, null);
				}
				case 'VariableDeclarator':
					// e.g. `const a = v`
					return parent.init !== node || isPatternMutated(parent.id, null);
				case 'ForOfStatement':
					if (parent.right !== node) return true;
					// e.g. `for (const item of v)`
					return isPatternMutated(
						parent.left.type === 'VariableDeclaration'
							? parent.left.declarations[0].id
							: parent.left,
						null
					);
				case 'ReturnStatement':
					return isReturnMutated(parent, callback);
				case 'ArrowFunctionExpression':
					return parent.body !== node || isReturnMutated(parent, callback);
				case 'TemplateLiteral':
					// e.g. tag`${v}`. The tag gets the value.
					return parent.parent?.type === 'TaggedTemplateExpression';
				case 'ForInStatement':
				case 'ExpressionStatement':
				case 'IfStatement':
				case 'WhileStatement':
				case 'DoWhileStatement':
				case 'ForStatement':
				case 'SwitchStatement':
				case 'SwitchCase':
				case 'TSTypeQuery':
				case 'TSQualifiedName':
				case 'SvelteIfBlock':
				case 'SvelteKeyBlock':
				case 'SvelteDebugTag':
				case 'SvelteStyleDirective':
					return false;
				case 'SvelteMustacheTag': {
					const owner = parent.parent as AnyNode | null;
					// e.g. `<option>{v}</option>`. Svelte uses it as the value of the option,
					// and `bind:value` of the `<select>` gives it back.
					if (isOptionElement(owner)) return true;
					return owner?.type === 'SvelteAttribute' && isAttributeEscaping(owner);
				}
				case 'SvelteShorthandAttribute':
					return isAttributeEscaping(parent);
				case 'SvelteDirective': {
					if (parent.kind === 'Class') return false;
					// e.g. `<input bind:value={a} />`. It only reassigns the variable.
					// `bind:value={a.b}` and binding an `{#each}` item change the object.
					const element = parent.parent.parent;
					return !(
						parent.kind === 'Binding' &&
						node === expression &&
						node.type === 'Identifier' &&
						!eachItems.has(findVariable(node)!) &&
						element.type === 'SvelteElement' &&
						element.kind === 'html' &&
						element.name.name !== 'slot' &&
						!element.name.name.includes('-') &&
						!element.startTag.attributes.some(
							(attr) => attr.type === 'SvelteAttribute' && attr.key.name === 'is'
						)
					);
				}
				case 'SvelteEachBlock':
					// e.g. `{#each v as item}`. The key is only read.
					if (parent.expression !== node) return false;
					return parent.context != null && isPatternMutated(parent.context, null, true);
				default:
					return true;
			}
		}
	}

	/** Checks whether the expression always has a primitive value, which can't be mutated. */
	function isPrimitive(expression: TSESTree.Node): boolean {
		const node = unwrapTS(expression);
		switch (node.type) {
			case 'Literal':
				return !('regex' in node && node.regex);
			case 'TemplateLiteral':
			case 'BinaryExpression':
			case 'UnaryExpression':
			case 'UpdateExpression':
				return true;
			case 'LogicalExpression':
				return isPrimitive(node.left) && isPrimitive(node.right);
			case 'ConditionalExpression':
				return isPrimitive(node.consequent) && isPrimitive(node.alternate);
			case 'SequenceExpression':
				return isPrimitive(node.expressions[node.expressions.length - 1]);
			case 'Identifier':
				return node.name === 'undefined' && getGlobalName(node) != null;
			case 'CallExpression': {
				const name = getGlobalName(node.callee);
				if (name == null) return false;
				const [object, method] = name.split('.');
				return (
					name === 'JSON.stringify' ||
					PRIMITIVE_GLOBAL_FUNCTIONS.has(name) ||
					(method != null && READ_GLOBAL_OBJECTS.has(object))
				);
			}
			default:
				return false;
		}
	}

	/** Checks whether the literal has code, e.g. a getter or a method. */
	function hasCode(expression: TSESTree.Node): boolean {
		const node = unwrapTS(expression);
		if (node.type === 'ArrayExpression') {
			return node.elements.some((element) => element != null && hasCode(element));
		}
		if (node.type !== 'ObjectExpression') return false;
		return node.properties.some((property) => {
			if (property.type === 'SpreadElement') return hasCode(property.argument);
			if (property.kind !== 'init' || property.method) return true;
			const value = unwrapTS(property.value);
			return (
				value.type === 'FunctionExpression' ||
				value.type === 'ArrowFunctionExpression' ||
				value.type === 'ClassExpression' ||
				hasCode(value)
			);
		});
	}

	/** Returns the values assigned to the variable, or `null` if some can't be known. */
	function getAssignedValues(variable: Variable): TSESTree.Expression[] | null {
		const values: TSESTree.Expression[] = [];
		for (const reference of variable.references) {
			// The initial value of `$state()` is removed by the rewrite.
			if (reference.init || !reference.isWrite()) continue;
			const id = reference.identifier;
			const parent = id.parent;
			// e.g. `v++` or `v += 1`
			if (parent?.type === 'UpdateExpression') continue;
			if (parent?.type !== 'AssignmentExpression' || parent.left !== id) return null;
			if (!['=', '||=', '&&=', '??='].includes(parent.operator)) continue;
			values.push(parent.right);
		}
		return values;
	}

	return (variable: Variable) => {
		visited.clear();
		eachItems.clear();
		const values = getAssignedValues(variable);
		// e.g. `v = count * 2`. A primitive can't be mutated.
		if (values?.every(isPrimitive)) return false;
		// e.g. `v = { get a() { ... } }`. The rule assumes the object is data.
		if (values?.some(hasCode)) return true;
		return isVariableMutated(variable, null);
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
		const isDeeplyMutated = createMutationChecker(context);
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
				if (
					!def ||
					def.type !== 'Variable' ||
					def.node.type !== 'VariableDeclarator' ||
					// e.g. `let { a } = $state(x)`. `$derived` would destructure the new value.
					def.node.id.type !== 'Identifier'
				) {
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
