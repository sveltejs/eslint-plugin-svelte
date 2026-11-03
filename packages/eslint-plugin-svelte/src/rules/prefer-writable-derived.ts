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

type AnyNode = TSESTree.Node | AST.SvelteNode;
type LocalFunction =
	| TSESTree.FunctionDeclaration
	| TSESTree.FunctionExpression
	| TSESTree.ArrowFunctionExpression
	| AST.SvelteSnippetBlock;

/**
 * What a method or function returns, compared with the value it gets.
 * - `none`: something not shared with the value, e.g. `v.includes(x)` or `JSON.stringify(v)`.
 * - `self`: the value itself, e.g. `v.sort()`.
 * - `part`: a part of the value, e.g. `v.find(f)`.
 * - `newContainer`: a new array or object whose elements are shared with the value, e.g. `v.slice()`.
 */
type Result = 'none' | 'self' | 'part' | 'newContainer';

type MethodInfo = {
	result: Result;
	// Whether the method mutates the object it is called on.
	mutates?: boolean;
	// How the method uses its callback (the first argument).
	// `map` and `flatMap`: the returned values become the elements of the result.
	// `reduce`: the returned value becomes the accumulator and the result.
	// `other`: the returned value is not shared.
	callback?: 'map' | 'flatMap' | 'reduce' | 'other';
	// What the method does with its arguments.
	// `container`: they become elements of the result. `stored`: they are stored in the object.
	args?: 'container' | 'stored';
};

// `$state` makes only arrays and plain objects deeply reactive
// (https://svelte.dev/docs/svelte/$state#Deep-state).
// So the methods called on a part of the `$state` object are the methods of `Array.prototype`
// and `Object.prototype`, methods of primitives, methods of class instances (which are not proxied),
// or functions stored in the object. The methods below are classified by the spec.
// The others may be functions stored in the object, so they are treated as mutating it.
const ARRAY_METHODS: [string, MethodInfo][] = [
	['at', { result: 'part' }],
	['concat', { result: 'newContainer', args: 'container' }],
	['copyWithin', { result: 'self', mutates: true }],
	['entries', { result: 'newContainer' }],
	['every', { result: 'none', callback: 'other' }],
	['fill', { result: 'self', mutates: true, args: 'stored' }],
	['filter', { result: 'newContainer', callback: 'other' }],
	['find', { result: 'part', callback: 'other' }],
	['findIndex', { result: 'none', callback: 'other' }],
	['findLast', { result: 'part', callback: 'other' }],
	['findLastIndex', { result: 'none', callback: 'other' }],
	['flat', { result: 'newContainer' }],
	// The result comes from the returned values of the callback.
	['flatMap', { result: 'none', callback: 'flatMap' }],
	['forEach', { result: 'none', callback: 'other' }],
	['includes', { result: 'none' }],
	['indexOf', { result: 'none' }],
	['join', { result: 'none' }],
	['keys', { result: 'none' }],
	['lastIndexOf', { result: 'none' }],
	['map', { result: 'none', callback: 'map' }],
	['pop', { result: 'part', mutates: true }],
	['push', { result: 'none', mutates: true, args: 'stored' }],
	['reduce', { result: 'part', callback: 'reduce' }],
	['reduceRight', { result: 'part', callback: 'reduce' }],
	['reverse', { result: 'self', mutates: true }],
	['shift', { result: 'part', mutates: true }],
	['slice', { result: 'newContainer' }],
	['some', { result: 'none', callback: 'other' }],
	['sort', { result: 'self', mutates: true, callback: 'other' }],
	['splice', { result: 'newContainer', mutates: true, args: 'stored' }],
	['toLocaleString', { result: 'none' }],
	['toReversed', { result: 'newContainer' }],
	['toSorted', { result: 'newContainer', callback: 'other' }],
	['toSpliced', { result: 'newContainer', args: 'container' }],
	['toString', { result: 'none' }],
	['unshift', { result: 'none', mutates: true, args: 'stored' }],
	['values', { result: 'newContainer' }],
	['with', { result: 'newContainer', args: 'container' }],
	// Object.prototype
	['hasOwnProperty', { result: 'none' }],
	['isPrototypeOf', { result: 'none' }],
	['propertyIsEnumerable', { result: 'none' }],
	['valueOf', { result: 'self' }]
];

// Methods that only read primitives (String.prototype and Number.prototype)
// or class instances that `$state` doesn't proxy (Date.prototype).
const READ_ONLY_METHODS = [
	// String
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
	// Number
	'toExponential',
	'toFixed',
	'toPrecision',
	// Date
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
];

const METHODS = new Map<string, MethodInfo>([
	...READ_ONLY_METHODS.map((name): [string, MethodInfo] => [name, { result: 'none' }]),
	...ARRAY_METHODS
]);

// Global functions that return primitives and don't change their arguments.
const PRIMITIVE_GLOBAL_FUNCTIONS = new Set([
	'Array.isArray',
	'BigInt',
	'Boolean',
	'JSON.stringify',
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

// Global objects whose methods don't change their arguments and don't return them.
const READ_ONLY_GLOBAL_OBJECTS = new Set(['Math', 'console']);

// Global functions (and runes) that don't change their arguments.
const GLOBAL_FUNCTIONS = new Map<string, Result>([
	...[...PRIMITIVE_GLOBAL_FUNCTIONS].map((name): [string, Result] => [name, 'none']),
	['Object.getOwnPropertyNames', 'none'],
	['Object.keys', 'none'],
	// Deep copies.
	['$state.snapshot', 'none'],
	['structuredClone', 'none'],
	['Array.from', 'newContainer'],
	['Array.of', 'newContainer'],
	['Object.entries', 'newContainer'],
	['Object.fromEntries', 'newContainer'],
	['Object.values', 'newContainer']
]);

// Properties that the language may read and call implicitly,
// e.g. `toString` in `${value}` or `then` in `await value`.
const PROTOCOL_PROPERTIES = new Set([
	'__proto__',
	'constructor',
	'then',
	'toJSON',
	'toLocaleString',
	'toString',
	'valueOf'
]);

// Runes that return the given value itself (or the same proxy).
const PASS_THROUGH_RUNES = new Set(['$derived', '$state', '$state.eager', '$state.raw']);

// Functions that ignore what their callback returns (or only call it when it is a function).
const IGNORE_RETURN_FUNCTIONS = new Set([
	'$effect',
	'$effect.pre',
	'$effect.root',
	'queueMicrotask',
	'requestAnimationFrame',
	'setInterval',
	'setTimeout',
	'svelte#onDestroy',
	'svelte#onMount'
]);

// Functions that return what their callback returns.
const RETURN_CALLBACK_RESULT_FUNCTIONS = new Set(['$derived.by', 'svelte#untrack']);

// Modules whose transition and animation functions don't change their parameters.
const SVELTE_MOTION_MODULES = new Set(['svelte/animate', 'svelte/transition']);

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

function isComponentElement(element: AnyNode | null | undefined): boolean {
	if (element?.type !== 'SvelteElement') return false;
	return (
		element.kind === 'component' ||
		(element.kind === 'special' &&
			(element.name.name === 'svelte:component' || element.name.name === 'svelte:self'))
	);
}

function isExportDeclaration(node: AnyNode | null | undefined): boolean {
	return node?.type === 'ExportNamedDeclaration' || node?.type === 'ExportDefaultDeclaration';
}

/**
 * How deep the shared parts are in a followed value.
 * - `0`: the object of the `$state` variable or a part of it, e.g. `v` or `v.a`.
 *   Changing its properties mutates the object.
 * - `1`: a new array or object whose elements are shared, e.g. `v.slice()` or `[...v]`.
 * - `2`: a new container of such containers.
 * - `eachItem`: an `{#each}` item. Like `0`, and assigning to it also mutates the array.
 */
type Mode = 0 | 1 | 2 | 'eachItem';

function toDepth(mode: Mode): number {
	return mode === 'eachItem' ? 0 : mode;
}

/** Converts a depth to a mode. Deeper values are treated as `2`, which is safe. */
function toMode(depth: number): Mode {
	return Math.max(0, Math.min(depth, 2)) as 0 | 1 | 2;
}

// Gives up following values when they go deeper than this, and treats them as mutated.
const MAX_DEPTH = 100;

/**
 * Checks whether the object of the variable may be mutated, e.g. `v.a = 1`, `v.push(1)`,
 * `bind:value={v.a}` or passing it to a function that may change it.
 * It follows values that point to the same object, e.g. `const a = v`, `{#each v as item}`,
 * `v.forEach((item) => ...)` or `fn(v)` for a local function.
 * Any use that it can't follow is treated as a mutation.
 * `$state` makes objects deeply reactive but `$derived` does not,
 * so such a variable can't be rewritten to `$derived`.
 */
function createDeepMutationChecker(context: RuleContext) {
	const findVariableContext = new FindVariableContext(context);
	const variables = new Map<TSESTree.Identifier, Variable | null>();
	// The results that don't depend on where the check started. Kept for the whole file.
	const cache = new Map<object, Map<string, boolean>>();
	// The checks running in the current check.
	const visited = new Map<object, Set<string>>();
	// The number of times a check stopped early because of `visited` or `MAX_DEPTH`.
	// A result is cached only when it didn't stop early.
	let stops = 0;
	let depth = 0;

	function findVariable(node: TSESTree.Identifier): Variable | null {
		if (!variables.has(node)) variables.set(node, findVariableContext.findVariable(node));
		return variables.get(node)!;
	}

	function withCache(key: object, mode: string, check: () => boolean): boolean {
		const cached = cache.get(key)?.get(mode);
		if (cached != null) return cached;
		const visitedModes = visited.get(key) ?? new Set<string>();
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
			const modes = cache.get(key) ?? new Map<string, boolean>();
			modes.set(mode, result);
			cache.set(key, modes);
		}
		return result;
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

	/** Returns the name of the imported function, e.g. `svelte#untrack`. */
	function getImportName(callee: TSESTree.Node): string | null {
		const node = unwrapTS(callee);
		if (node.type !== 'Identifier') return null;
		const def = findVariable(node)?.defs[0];
		if (def?.type !== 'ImportBinding' || def.node.type !== 'ImportSpecifier') return null;
		const imported = def.node.imported;
		const name = imported.type === 'Identifier' ? imported.name : String(imported.value);
		return `${(def.parent as TSESTree.ImportDeclaration).source.value}#${name}`;
	}

	function getFunctionName(callee: TSESTree.Node): string | null {
		return getGlobalName(callee) ?? getImportName(callee);
	}

	/** Returns what the global function returns, or `null` if it may change its arguments. */
	function getGlobalFunctionResult(
		callee: TSESTree.Node,
		call?: TSESTree.CallExpression
	): Result | null {
		const name = getGlobalName(callee);
		if (name == null) return null;
		// e.g. `JSON.stringify(v, (key, value) => ...)`. The replacer gets parts of the value.
		if (name === 'JSON.stringify' && call && call.arguments.length >= 2) {
			const replacer = unwrapTS(call.arguments[1]);
			if (
				replacer.type !== 'ArrayExpression' &&
				!(replacer.type === 'Literal' && replacer.value === null)
			) {
				return null;
			}
		}
		const result = GLOBAL_FUNCTIONS.get(name);
		if (result) return result;
		const [object, method] = name.split('.');
		return method != null && READ_ONLY_GLOBAL_OBJECTS.has(object) ? 'none' : null;
	}

	function getMethodInfo(member: TSESTree.MemberExpression): MethodInfo | null {
		const name = getPropertyName(member, getScope(context, member));
		return name == null ? null : (METHODS.get(name) ?? null);
	}

	/** Checks whether the variable is exported, so it may be used in other files. */
	function isExported(variable: Variable): boolean {
		return variable.defs.some((def) =>
			isExportDeclaration(
				def.node.type === 'VariableDeclarator' ? def.node.parent?.parent : def.node.parent
			)
		);
	}

	/** Checks whether the variable (which gets the object or a part of it) is mutated. */
	function isVariableMutated(variable: Variable, mode: Mode): boolean {
		return withCache(
			variable,
			String(mode),
			() =>
				isExported(variable) ||
				variable.references.some(
					(reference) =>
						// Skip the declaration itself, e.g. `{ a = 1 }` in `{#each v as { a = 1 }}`.
						!reference.init && isValueMutated(reference.identifier as TSESTree.Identifier, mode)
				)
		);
	}

	/**
	 * Checks whether the node is an array literal or an object literal without accessors, methods
	 * or properties that the language may call (e.g. `toString`), so using it doesn't run any code.
	 */
	function isPlainLiteral(expression: TSESTree.Node): boolean {
		const node = unwrapTS(expression);
		if (node.type === 'ArrayExpression') return true;
		if (node.type !== 'ObjectExpression') return false;
		return node.properties.every((property) => {
			if (property.type === 'SpreadElement') return true;
			if (property.kind !== 'init' || property.method) return false;
			const name = getPropertyName(property, getScope(context, property));
			return name != null && !PROTOCOL_PROPERTIES.has(name);
		});
	}

	/** Checks whether the literal (or a literal in it) has code that may run with it as `this`. */
	function hasCodeInLiteral(expression: TSESTree.Node): boolean {
		const node = unwrapTS(expression);
		if (node.type === 'ArrayExpression') {
			return node.elements.some((element) => element != null && hasCodeInLiteral(element));
		}
		if (node.type !== 'ObjectExpression') return false;
		return (
			!isPlainLiteral(node) ||
			node.properties.some(
				(property) => property.type === 'Property' && hasCodeInLiteral(property.value)
			)
		);
	}

	/**
	 * Checks whether the node is a local array literal or a string, whose methods are built-in.
	 * Other objects may have their own methods with the same names.
	 */
	function isBuiltinReceiver(expression: TSESTree.Node): boolean {
		const node = unwrapTS(expression);
		if (node.type === 'ArrayExpression' || node.type === 'TemplateLiteral') return true;
		if (node.type === 'Literal') return typeof node.value === 'string';
		if (node.type !== 'Identifier') return false;
		const variable = getNewContainerVariable(node);
		const def = variable?.defs[0];
		return (
			def?.type === 'Variable' &&
			def.node.init != null &&
			unwrapTS(def.node.init).type === 'ArrayExpression' &&
			// e.g. `a.includes = fn`
			!variable!.references.some((reference) => {
				const member = reference.identifier.parent;
				return (
					member?.type === 'MemberExpression' &&
					member.object === reference.identifier &&
					member.parent?.type === 'AssignmentExpression' &&
					member.parent.left === member &&
					!/^\d+$/u.test(getPropertyName(member, getScope(context, member)) ?? '')
				);
			})
		);
	}

	// Calls of built-in methods on followed values, e.g. `v.map(f)`.
	// Their callbacks are called by the built-in methods.
	const builtinCalls = new Set<TSESTree.CallExpression>();

	/**
	 * Checks a variable declared with a new array or object, e.g. `const a = []`,
	 * which doesn't share its value with others before.
	 */
	function getNewContainerVariable(node: TSESTree.Node): Variable | null {
		let root = unwrapTS(node);
		while (root.type === 'MemberExpression') root = unwrapTS(root.object);
		if (root.type !== 'Identifier') return null;
		const variable = findVariable(root);
		const def = variable?.defs[0];
		if (
			!variable ||
			variable.defs.length !== 1 ||
			def?.type !== 'Variable' ||
			def.node.id.type !== 'Identifier' ||
			!def.node.init ||
			!isPlainLiteral(def.node.init) ||
			variable.references.some((reference) => reference.isWrite() && !reference.init)
		) {
			return null;
		}
		return variable;
	}

	/** Checks the value stored in another object, e.g. `a.b = v` or `a.push(v)`. */
	function isStoredValueMutated(container: TSESTree.Node, mode: Mode): boolean {
		// We follow only new local arrays and objects. Others may be shared with any code.
		const variable = getNewContainerVariable(container);
		return variable == null || isVariableMutated(variable, toMode(toDepth(mode) + 1));
	}

	/** Checks the variables declared by the pattern, which get the object or a part of it. */
	function isPatternMutated(pattern: TSESTree.Node, mode: Mode): boolean {
		const depth = toDepth(mode);
		const partMode = mode === 'eachItem' ? 'eachItem' : toMode(depth - 1);
		// A new container. Its elements may be shared at any depth, so `1` is used to be safe.
		const restMode = 1;
		switch (pattern.type) {
			case 'Identifier': {
				const variable = findVariable(pattern);
				return variable == null || isVariableMutated(variable, mode);
			}
			case 'ObjectPattern':
				return pattern.properties.some((property) =>
					property.type === 'Property'
						? isPatternMutated(property.value, partMode)
						: isPatternMutated(property.argument, restMode)
				);
			case 'ArrayPattern':
				return pattern.elements.some(
					(element) =>
						element != null &&
						(element.type === 'RestElement'
							? isPatternMutated(element.argument, restMode)
							: isPatternMutated(element, partMode))
				);
			case 'RestElement':
				// e.g. `function f(...args) {}`. `args` is a new array that has the value.
				return isPatternMutated(pattern.argument, toMode(depth + 1));
			case 'AssignmentPattern':
				return isPatternMutated(pattern.left, mode);
			case 'MemberExpression':
				// e.g. `a.b = v`
				return isStoredValueMutated(pattern.object, mode);
			default:
				return true;
		}
	}

	/** Returns the local function (or snippet) that the given callee points to. */
	function getLocalFunction(callee: TSESTree.Node): LocalFunction | null {
		const node = unwrapTS(callee);
		if (isFunction(node)) return node;
		if (node.type !== 'Identifier') return null;
		const variable = findVariable(node);
		// e.g. `let fn = () => {}; fn = other;`. We can't know which function is called.
		if (
			!variable ||
			variable.references.some((reference) => reference.isWrite() && !reference.init)
		) {
			return null;
		}
		// e.g. `var fn = a; var fn = b;`. A TS overload signature has no body, so it's skipped.
		const defs = variable.defs.filter((def) => def.node.type !== 'TSDeclareFunction');
		if (defs.length !== 1) return null;
		for (const def of defs) {
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

	/** Checks whether the function uses `arguments`, which has all arguments. */
	function usesArguments(fn: LocalFunction): boolean {
		if (fn.type !== 'FunctionDeclaration' && fn.type !== 'FunctionExpression') return false;
		const scope = context.sourceCode.scopeManager?.acquire(fn);
		return (scope?.set.get('arguments')?.references.length ?? 0) > 0;
	}

	/** Checks whether the function returns a value, e.g. `return { update(param) {} }`. */
	function hasReturnValue(fn: LocalFunction): boolean {
		if (fn.type === 'SvelteSnippetBlock') return false;
		if (fn.body.type !== 'BlockStatement') return true;

		/** Checks the nodes, skipping nested functions. */
		function visit(node: unknown): boolean {
			if (!node || typeof node !== 'object') return false;
			if (Array.isArray(node)) return node.some(visit);
			const n = node as TSESTree.Node;
			if (n.type === 'ReturnStatement') return n.argument != null;
			if (isFunction(n)) return false;
			return Object.entries(n).some(([key, value]) => key !== 'parent' && visit(value));
		}

		return visit(fn.body.body);
	}

	/** Checks the parameter of a local function (or snippet) that gets the value. */
	function isParamMutated(fn: LocalFunction, index: number, mode: Mode): boolean {
		// e.g. `function f() { arguments[0].a = 1; }`
		if (usesArguments(fn)) return true;
		const params = (fn.params as TSESTree.Parameter[]).filter(
			// TS `this` parameter, e.g. `function f(this: T, a) {}`
			(param) => param.type !== 'Identifier' || param.name !== 'this'
		);
		for (let i = 0; i < params.length; i++) {
			const param = params[i];
			if (param.type === 'RestElement') return isPatternMutated(param, mode);
			if (i === index) return isPatternMutated(param, mode);
		}
		return false;
	}

	/**
	 * Checks the parameters of a callback.
	 * `getMode` returns the mode of the value that the parameter gets, or `null` if it is not shared.
	 */
	function isCallbackParamMutated(
		callback: TSESTree.Node | undefined,
		getMode: (index: number) => Mode | null
	): boolean {
		if (!callback) return false;
		const fn = getLocalFunction(callback);
		if (fn) {
			return [0, 1, 2, 3].some((index) => {
				const mode = getMode(index);
				return mode != null && isParamMutated(fn, index, mode);
			});
		}
		// e.g. `v.filter(Boolean)`
		return getGlobalFunctionResult(callback) !== 'none';
	}

	/** Returns the modes of the parameters of a callback for an array method. */
	function getArrayCallbackModes(
		method: string,
		call: TSESTree.CallExpression,
		objectDepth: number
	): (index: number) => Mode | null {
		const element = toMode(objectDepth - 1);
		const array = toMode(objectDepth);
		if (method === 'reduce' || method === 'reduceRight') {
			// The accumulator is the first element only when no initial value is given.
			const hasInitialValue = call.arguments.length >= 2;
			return (index) =>
				index === 1 || (index === 0 && !hasInitialValue) ? element : index === 3 ? array : null;
		}
		if (method === 'sort' || method === 'toSorted') {
			return (index) => (index <= 1 ? element : null);
		}
		return (index) => (index === 0 ? element : index === 2 ? array : null);
	}

	/** Checks a function that gets the value as an argument, e.g. `fn(v)` or `fn(...v)`. */
	function isArgumentMutated(
		call: TSESTree.CallExpression,
		index: number,
		mode: Mode,
		spread: boolean
	): boolean {
		// We can't know which parameter gets the value.
		if (call.arguments.slice(0, index).some((arg) => arg.type === 'SpreadElement')) return true;
		const fn = getLocalFunction(call.callee);
		if (!fn) return true;
		if (!spread) return isParamMutated(fn, index, toMode(toDepth(mode)));
		// e.g. `fn(...v)`. The parameters from there get the elements.
		const elementMode = toMode(toDepth(mode) - 1);
		return fn.params.some((_, i) => i >= index && isParamMutated(fn, i, elementMode));
	}

	/** Checks `$inspect(v).with(callback)`. The callback gets the value. */
	function isInspectMutated(call: TSESTree.CallExpression, mode: Mode): boolean {
		const member = call.parent;
		if (member?.type !== 'MemberExpression' || member.object !== call) return false;
		const withCall = member.parent;
		if (withCall?.type !== 'CallExpression' || withCall.callee !== member) return true;
		return withCall.arguments.some((arg) =>
			isCallbackParamMutated(arg, (index) => (index >= 1 ? toMode(toDepth(mode)) : null))
		);
	}

	/**
	 * Checks what is done with the value returned by a function that is passed as an argument,
	 * e.g. `$derived.by(() => v)` or `v.map((item) => item)`.
	 */
	function isCallbackResultMutated(
		call: TSESTree.CallExpression,
		index: number,
		mode: Mode
	): boolean {
		const depth = toDepth(mode);
		const name = getFunctionName(call.callee);
		if (index === 0 && name != null) {
			if (RETURN_CALLBACK_RESULT_FUNCTIONS.has(name)) return isValueMutated(call, mode);
			if (IGNORE_RETURN_FUNCTIONS.has(name)) return false;
		}
		// e.g. `Array.from(v, (item) => item)`
		if (index === 1 && name === 'Array.from') return isValueMutated(call, toMode(depth + 1));
		const callee = unwrapTS(call.callee);
		if (
			index !== 0 ||
			callee.type !== 'MemberExpression' ||
			!(builtinCalls.has(call) || isBuiltinReceiver(callee.object))
		) {
			return true;
		}
		switch (getMethodInfo(callee)?.callback) {
			case 'map':
				return isValueMutated(call, toMode(depth + 1));
			case 'flatMap':
				return isValueMutated(call, 1);
			case 'reduce': {
				// The returned value becomes the next accumulator and the result.
				const fn = getLocalFunction(call.arguments[0]);
				return fn == null || isParamMutated(fn, 0, mode) || isValueMutated(call, mode);
			}
			case 'other':
				return false;
			default:
				return true;
		}
	}

	/**
	 * Checks what is done with the value returned by the function,
	 * through the given node that has the function, e.g. `get()` for `const get = () => v`.
	 */
	function isFunctionResultMutated(use: TSESTree.Node, mode: Mode): boolean {
		let node = use;
		while (node.parent && TS_WRAPPERS.has(node.parent.type)) node = node.parent;
		const parent = node.parent as AnyNode | undefined;
		switch (parent?.type) {
			case 'CallExpression':
				// e.g. `get()`
				if (parent.callee === node) return isValueMutated(parent, mode);
				return isCallbackResultMutated(
					parent,
					parent.arguments.indexOf(node as TSESTree.CallExpressionArgument),
					mode
				);
			case 'VariableDeclarator': {
				// e.g. `const get = () => v`
				if (parent.init !== node || parent.id.type !== 'Identifier') return true;
				const variable = findVariable(parent.id);
				return variable == null || isFunctionVariableResultMutated(variable, mode);
			}
			case 'SvelteMustacheTag': {
				// e.g. `<button onclick={() => v}>`. Elements ignore the returned value,
				// but components may call it and change the value.
				const attribute = parent.parent as AnyNode;
				return attribute.type === 'SvelteAttribute' && isComponentElement(attribute.parent?.parent);
			}
			case 'SvelteDirective':
				// e.g. `on:click={() => v}`
				return parent.kind !== 'EventHandler';
			default:
				break;
		}
		if ((parent?.type as string) === 'SvelteFunctionBindingsExpression') {
			// e.g. `bind:value={() => v, (x) => (v = x)}`. A component may change the value of the getter.
			const bindings = parent as unknown as TSESTree.SequenceExpression;
			const directive = bindings.parent as AnyNode | undefined;
			return bindings.expressions[0] === node && isComponentElement(directive?.parent?.parent);
		}
		return true;
	}

	/** Checks the calls through the references of the variable that has the function. */
	function isFunctionVariableResultMutated(variable: Variable, mode: Mode): boolean {
		return withCache(
			variable,
			`function:${mode}`,
			() =>
				isExported(variable) ||
				variable.references.some(
					(reference) => !reference.init && isFunctionResultMutated(reference.identifier, mode)
				)
		);
	}

	/** Checks the values returned by the function, e.g. `get().a = 1` for `const get = () => v`. */
	function isReturnedValueMutated(fn: LocalFunction, mode: Mode): boolean {
		if (fn.type === 'SvelteSnippetBlock') return false;
		return withCache(fn, `return:${mode}`, () => {
			if (fn.type !== 'FunctionDeclaration') return isFunctionResultMutated(fn, mode);
			if (isExportDeclaration(fn.parent)) return true;
			const variable = fn.id && findVariable(fn.id);
			return variable == null || isFunctionVariableResultMutated(variable, mode);
		});
	}

	/**
	 * Checks whether the value of the attribute may be kept and given back to other code.
	 * A component may pass a prop back through a callback, a snippet or a binding,
	 * and `value` of `<option>` and `<input>` is given back by `bind:value` and `bind:group`.
	 * Custom elements get values as properties.
	 */
	function isAttributeEscaping(
		attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute
	): boolean {
		const element = attribute.parent.parent;
		if (element.type !== 'SvelteElement') return true;
		if (element.kind === 'component') return true;
		if (element.kind === 'special') {
			return ['svelte:component', 'svelte:element', 'svelte:self'].includes(element.name.name);
		}
		return element.name.name.includes('-') || attribute.key.name === 'value';
	}

	/**
	 * Checks whether the value of the given expression may be mutated.
	 * `mode` tells how the value relates to the object of the `$state` variable.
	 */
	function isValueMutated(expression: TSESTree.Node, mode: Mode): boolean {
		let node: TSESTree.Node = expression;
		let depth = toDepth(mode);
		// Whether assigning to `node` mutates the object, e.g. `v.a` or an `{#each}` item.
		let isWritable = mode === 'eachItem';
		// When `node` is `object.property`: the name of the property and the depth of `object`.
		let member: { property: string | null; objectDepth: number } | null = null;

		function moveTo(next: TSESTree.Node, nextDepth: number) {
			node = next;
			depth = toDepth(toMode(nextDepth));
			isWritable = false;
			member = null;
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
					node = parent;
					continue;
				case 'AwaitExpression':
				case 'LogicalExpression':
					// e.g. `(v || x).a = 1`
					moveTo(parent, depth);
					continue;
				case 'ConditionalExpression':
					if (parent.test === node) return false;
					moveTo(parent, depth);
					continue;
				case 'SequenceExpression':
					if (parent.expressions[parent.expressions.length - 1] !== node) return false;
					moveTo(parent, depth);
					continue;
				case 'SpreadElement': {
					const container = parent.parent as AnyNode;
					if (container.type === 'ArrayExpression' || container.type === 'ObjectExpression') {
						// e.g. `[...v]` or `{ ...v }`. A new container whose elements are shared.
						if (!isPlainLiteral(container as TSESTree.Node)) return true;
						moveTo(container as TSESTree.Node, 1);
						continue;
					}
					if (container.type !== 'CallExpression') return true;
					// e.g. `fn(...v)`
					const index = container.arguments.indexOf(parent);
					const result = getGlobalFunctionResult(container.callee, container);
					if (result === 'none') return false;
					if (result === 'newContainer' && index === 0) {
						moveTo(container, 1);
						continue;
					}
					return isArgumentMutated(container, index, toMode(depth), true);
				}
				case 'MemberExpression':
					// e.g. `x[v]`
					if (parent.object !== node) return false;
					member = {
						property: getPropertyName(parent, getScope(context, parent)),
						objectDepth: depth
					};
					isWritable = depth === 0;
					depth = Math.max(depth - 1, 0);
					node = parent;
					continue;
				case 'CallExpression': {
					if (parent.callee === node) {
						// e.g. `v()`. It doesn't get the object as `this`.
						if (!member) return false;
						const { property, objectDepth } = member;
						const info = property == null ? null : METHODS.get(property);
						// It may be a function stored in the object, which may mutate it.
						if (!info) return true;
						// e.g. `v.push(1)`
						if (info.mutates && objectDepth === 0) return true;
						builtinCalls.add(parent);
						// e.g. `v.forEach((item) => (item.a = 1))`
						if (
							info.callback &&
							isCallbackParamMutated(
								parent.arguments[0],
								getArrayCallbackModes(property!, parent, objectDepth)
							)
						) {
							return true;
						}
						if (info.result === 'none') return false;
						moveTo(
							parent,
							info.result === 'self' ? objectDepth : info.result === 'part' ? objectDepth - 1 : 1
						);
						continue;
					}
					const index = parent.arguments.indexOf(node as TSESTree.CallExpressionArgument);
					const name = getGlobalName(parent.callee);
					if (name != null && PASS_THROUGH_RUNES.has(name) && index === 0) {
						// e.g. `const a = $derived(v)`
						moveTo(parent, depth);
						continue;
					}
					if (name === '$inspect') return isInspectMutated(parent, toMode(depth));
					const result = getGlobalFunctionResult(parent.callee, parent);
					if (result === 'none') return false;
					if (result === 'newContainer' && index === 0) {
						// e.g. `Array.from(v, (item) => ...)`
						const elementMode = toMode(depth - 1);
						if (
							name === 'Array.from' &&
							isCallbackParamMutated(parent.arguments[1], (i) => (i === 0 ? elementMode : null))
						) {
							return true;
						}
						moveTo(parent, 1);
						continue;
					}
					const callee = unwrapTS(parent.callee);
					// Methods are matched by name only when the object is known to be built-in.
					const info =
						callee.type === 'MemberExpression' && isBuiltinReceiver(callee.object)
							? getMethodInfo(callee)
							: null;
					if (callee.type === 'MemberExpression' && info) {
						// e.g. `a.includes(v)`. The first argument of methods with a callback is the callback.
						// Other arguments of them (e.g. `thisArg`) may be passed to the callback.
						if (info.callback) return index !== 0;
						// e.g. `a.push(v)`
						if (info.args === 'stored') return isStoredValueMutated(callee.object, toMode(depth));
						if (info.args === 'container') {
							// e.g. `a.concat(v)`
							moveTo(parent, 1);
							continue;
						}
						return false;
					}
					// e.g. `fn(v)` or `{@render snippet(v)}`
					return isArgumentMutated(parent, index, toMode(depth), false);
				}
				case 'NewExpression':
					// e.g. `new Date(v)`
					return parent.callee !== node && getGlobalName(parent.callee) !== 'Date';
				case 'ReturnStatement':
				case 'ArrowFunctionExpression': {
					if (parent.type === 'ArrowFunctionExpression' && parent.body !== node) return false;
					// e.g. `$derived.by(() => v)` or `const get = () => v`
					let fn: AnyNode | undefined = parent;
					while (fn && !isFunction(fn)) {
						fn = fn.parent as AnyNode | undefined;
					}
					return !isFunction(fn) || isReturnedValueMutated(fn, toMode(depth));
				}
				case 'AssignmentExpression':
					if (parent.left === node) {
						// e.g. `copy.toString = fn`. The language may call it with the object as `this`.
						if (
							member &&
							(member.property == null || PROTOCOL_PROPERTIES.has(member.property)) &&
							!isPrimitive(parent.right)
						) {
							return true;
						}
						return isWritable;
					}
					// e.g. `a += v`. The result is a primitive.
					if (!['=', '||=', '&&=', '??='].includes(parent.operator)) return false;
					// e.g. `a = v`
					if (isPatternMutated(parent.left, toMode(depth))) return true;
					moveTo(parent, depth);
					continue;
				case 'UpdateExpression':
					return isWritable;
				case 'UnaryExpression':
					return parent.operator === 'delete' && isWritable;
				case 'TemplateLiteral':
					// e.g. tag`${v}`. The tag gets the value.
					return parent.parent?.type === 'TaggedTemplateExpression';
				case 'SvelteMustacheTag': {
					const attribute = parent.parent as AnyNode | null;
					return attribute?.type === 'SvelteAttribute' && isAttributeEscaping(attribute);
				}
				case 'SvelteShorthandAttribute':
					return isAttributeEscaping(parent);
				case 'SvelteSpreadAttribute':
					// e.g. `<Child {...v} />`. It may set any attribute.
					return true;
				case 'BinaryExpression':
				case 'ExpressionStatement':
				case 'IfStatement':
				case 'WhileStatement':
				case 'DoWhileStatement':
				case 'ForStatement':
				case 'SwitchStatement':
				case 'SwitchCase':
				case 'TSTypeQuery':
				case 'TSQualifiedName':
				case 'SvelteSpecialDirective':
				case 'SvelteStyleDirective':
				case 'SvelteIfBlock':
				case 'SvelteKeyBlock':
				case 'SvelteDebugTag':
				case 'SvelteRenderTag':
					return false;
				case 'VariableDeclarator':
					// e.g. `const a = v`
					return parent.init === node && isPatternMutated(parent.id, toMode(depth));
				case 'Property':
					if (parent.parent?.type === 'ObjectPattern') {
						// e.g. `({ a: v.a } = x)`
						return parent.value === node && isWritable;
					}
					// e.g. `({ [v]: 1 })`
					if (parent.value !== node) return false;
					// e.g. `({ a: v })`. Methods of the object may get it as `this`.
					if (!isPlainLiteral(parent.parent)) return true;
					moveTo(parent.parent, depth + 1);
					continue;
				case 'ArrayExpression':
					// e.g. `[v]`
					moveTo(parent, depth + 1);
					continue;
				case 'ArrayPattern':
				case 'RestElement':
					// e.g. `[v.a] = x`
					return isWritable;
				case 'AssignmentPattern':
					if (parent.left === node) return isWritable;
					// e.g. `const { a = v } = x`
					return isPatternMutated(parent.left, toMode(depth));
				case 'ForOfStatement':
				case 'ForInStatement':
					if (parent.left === node) return isWritable;
					if (parent.type === 'ForInStatement') return false;
					// e.g. `for (const item of v)`
					return isPatternMutated(
						parent.left.type === 'VariableDeclaration'
							? parent.left.declarations[0].id
							: parent.left,
						toMode(depth - 1)
					);
				case 'SvelteEachBlock':
					// e.g. `{#each v as item}`
					return (
						parent.expression === node &&
						parent.context != null &&
						isPatternMutated(parent.context, depth === 0 ? 'eachItem' : toMode(depth - 1))
					);
				case 'SvelteAwaitBlock': {
					// e.g. `{#await v then value}`. `value` is `v` if it is not a promise.
					const value = parent.then?.value;
					return (
						parent.expression === node && value != null && isPatternMutated(value, toMode(depth))
					);
				}
				case 'SvelteDirective': {
					if (parent.kind === 'Binding') {
						if (isWritable) return true;
						// e.g. `<Child bind:value={v} />` may mutate it. `bind:this` never does.
						return (
							isComponentElement(parent.parent?.parent) &&
							(parent.key.name as { name?: unknown }).name !== 'this'
						);
					}
					if (parent.kind === 'Class') return false;
					// e.g. `on:click={v.handler}`. A component may call it with anything.
					if (parent.kind === 'EventHandler') return isComponentElement(parent.parent?.parent);
					if (
						parent.kind !== 'Action' &&
						parent.kind !== 'Transition' &&
						parent.kind !== 'Animation'
					) {
						return true;
					}
					// e.g. `use:action={v}`
					const name = parent.key.name;
					if (name.type !== 'Identifier') return true;
					const importName = getImportName(name);
					if (importName != null && SVELTE_MOTION_MODULES.has(importName.split('#')[0])) {
						return false;
					}
					const fn = getLocalFunction(name);
					return (
						fn == null ||
						// An action may return `update`, which gets the new value.
						(parent.kind === 'Action' && hasReturnValue(fn)) ||
						isParamMutated(fn, parent.kind === 'Animation' ? 2 : 1, toMode(depth))
					);
				}
				default:
					return true;
			}
		}
		return true;
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
					PRIMITIVE_GLOBAL_FUNCTIONS.has(name) ||
					(method != null && READ_ONLY_GLOBAL_OBJECTS.has(object))
				);
			}
			default:
				return false;
		}
	}

	/** Checks whether a value assigned to the variable is a literal with code, e.g. a getter. */
	function hasAssignedCode(variable: Variable): boolean {
		return variable.references.some((reference) => {
			const parent = reference.identifier.parent;
			return (
				!reference.init &&
				parent?.type === 'AssignmentExpression' &&
				parent.left === reference.identifier &&
				hasCodeInLiteral(parent.right)
			);
		});
	}

	/** Checks whether every value assigned to the variable is a primitive. */
	function hasOnlyPrimitives(variable: Variable): boolean {
		return variable.references.every((reference) => {
			// The initial value of `$state()` is removed by the rewrite.
			if (reference.init || !reference.isWrite()) return true;
			const id = reference.identifier;
			const parent = id.parent;
			if (parent?.type === 'UpdateExpression') return true;
			if (parent?.type !== 'AssignmentExpression' || parent.left !== id) return false;
			// e.g. `v += 1`
			if (!['=', '||=', '&&=', '??='].includes(parent.operator)) return true;
			return isPrimitive(parent.right);
		});
	}

	return (variable: Variable) => {
		visited.clear();
		stops = 0;
		depth = 0;
		return (
			!hasOnlyPrimitives(variable) && (hasAssignedCode(variable) || isVariableMutated(variable, 0))
		);
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
