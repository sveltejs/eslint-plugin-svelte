import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import type { AST } from 'svelte-eslint-parser';
import type * as TS from 'typescript';
import {
	ReferenceTracker,
	findVariable as findVariableInScope,
	getInnermostScope,
	getPropertyName,
	getStaticValue
} from '@eslint-community/eslint-utils';
import semver from 'semver';
import { createRule } from '../utils/index.js';
import { findVariable, getScope } from '../utils/ast-utils.js';
import { getInstalledSvelteKitVersion, getSvelteContext } from '../utils/svelte-context.js';
import {
	type TSTools,
	getTypeScriptTools,
	isAnyType,
	isNullType,
	isUndefinedType,
	isUnknownType,
	isVoidType
} from '../utils/ts-utils/index.js';
import type { RuleContext, RuleFixer, SuggestionReportDescriptor } from '../types.js';

// ---------------------------------------------------------------------------
// Abstract URL values
//
// A URL expression is evaluated to a list of alternatives (one per possible
// branch). Each alternative is a sequence of parts. `null` stands for a
// nullish value (no URL at all).
// ---------------------------------------------------------------------------

type Part =
	/** A known piece of text. */
	| { readonly type: 'text'; readonly value: string }
	/** The result of `resolve()` / `asset()`: only `?…` or `#…` may follow it. */
	| { readonly type: 'resolved'; readonly label: string }
	/** A value that already starts with the base path and may be extended, e.g. `base` or `page.url`. */
	| { readonly type: 'based'; readonly label: string }
	/**
	 * Anything else. `string` means it is known not to be nullish, and `origin` that it is the
	 * origin of the page (never empty).
	 */
	| { readonly type: 'unknown'; readonly string?: true; readonly origin?: true };
type Alt = readonly Part[] | null;
type Value = readonly Alt[];

const UNKNOWN_PART: Part = { type: 'unknown' };
const STRING_PART: Part = { type: 'unknown', string: true };
const UNKNOWN: Value = [[UNKNOWN_PART]];
/** An unknown string (never nullish). */
const UNKNOWN_STRING: Value = [[STRING_PART]];
const NULLISH: Value = [null];
const RESOLVED: Value = [[{ type: 'resolved', label: 'resolve()' }]];

function resolved(label: string): Value {
	return [[{ type: 'resolved', label }]];
}

function based(label: string): Value {
	return [[{ type: 'based', label }]];
}

const MAX_ALTS = 64;
/** The number of steps to evaluate one URL, to stop on code that is too complex. */
const MAX_COMPUTATIONS = 5000;
const OUT_OF_BUDGET = new Error('out of budget');
const MAX_DEPTH = 64;

function text(value: string): Value {
	return [normalize([{ type: 'text', value }])];
}

function normalize(parts: readonly Part[]): Part[] {
	const result: Part[] = [];
	for (const part of parts) {
		const last = result[result.length - 1];
		if (part.type === 'text') {
			if (part.value === '') continue;
			if (last?.type === 'text') {
				result[result.length - 1] = { type: 'text', value: last.value + part.value };
				continue;
			}
		} else if (part.type === 'unknown' && last?.type === 'unknown') {
			continue;
		}
		result.push(part);
	}
	return result;
}

function union(...values: Value[]): Value {
	const result: Alt[] = [];
	const seen = new Set<string>();
	for (const value of values) {
		for (const alt of value) {
			const key = JSON.stringify(alt);
			if (seen.has(key)) continue;
			// Dropping alternatives can only hide problems, never invent them.
			if (result.length >= MAX_ALTS) return result;
			seen.add(key);
			result.push(alt);
		}
	}
	return result;
}

function concat(values: Value[]): Value {
	let result: Part[][] = [[]];
	for (const value of values) {
		const next: Part[][] = [];
		// In a string concatenation, a nullish value becomes `"null"` / `"undefined"`.
		const right = value.map((alt) => alt ?? [UNKNOWN_PART]);
		if (result.length * right.length > MAX_ALTS) {
			// Too many combinations: keep the heads, which decide the classification.
			for (const left of result) next.push(normalize([...left, UNKNOWN_PART]));
		} else {
			for (const left of result) {
				for (const r of right) next.push(normalize([...left, ...r]));
			}
		}
		result = union(next) as Part[][];
	}
	// The result of a concatenation is always a string.
	return union(
		result.map((alt) => (alt.length === 1 && alt[0].type === 'unknown' ? [STRING_PART] : alt))
	);
}

/** Forget the literal values learned from types. */
function untrustLiterals(value: Value): Value {
	return union(
		value.map((alt) => (alt?.length === 1 && alt[0].type === 'text' ? [STRING_PART] : alt))
	);
}

/** Whether the value may be `null` / `undefined`. */
function mayBeNullish(value: Value): boolean {
	return value.some(
		(alt) => alt === null || (alt.length === 1 && alt[0].type === 'unknown' && !alt[0].string)
	);
}

/** Whether the value may be falsy. */
function mayBeFalsy(value: Value): boolean {
	return mayBeNullish(value) || value.some((alt) => alt !== null && alt.length === 0);
}

function withoutNullish(value: Value): Value {
	return value.filter((alt) => alt !== null);
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

type Finding =
	| { readonly kind: 'ok' }
	/** Nothing is known about the URL. */
	| { readonly kind: 'unknown' }
	/** `resolve()` followed by an unknown value. */
	| { readonly kind: 'unknownSuffix'; readonly name: string }
	| { readonly kind: 'external'; readonly value: string }
	| { readonly kind: 'rootRelative'; readonly value: string; readonly complete: boolean }
	| { readonly kind: 'pathRelative'; readonly value: string }
	| {
			readonly kind: 'prefix';
			/** `resolve()`, `base`, ... */
			readonly name: string;
			readonly relativeInSsr: boolean;
			readonly value: string;
			/** What comes before `resolve()`. */
			/** `origin` is the origin of the page: absolute, but never empty. */
			readonly head: 'text' | 'external' | 'origin' | 'unknown';
	  }
	| { readonly kind: 'appended'; readonly value: string; readonly name: string };

const OK: Finding = { kind: 'ok' };
const SCHEME = /^[a-z][\d+\-.a-z]*:/iu;
const SCHEME_PREFIX = /^[a-z][\d+\-.a-z]*$/iu;
const PROTOCOL_RELATIVE = /^[/\\]{2}/u;
// Browsers ignore leading C0 control characters and spaces in URLs.
// eslint-disable-next-line no-control-regex -- U+0000 to U+0020 is intended
const LEADING_IGNORED = /^[\u0000-\u0020]+/u;
// eslint-disable-next-line no-control-regex -- U+0000 to U+0020 is intended
const TRAILING_IGNORED = /[\u0000-\u0020]+$/u;

function isExternalText(value: string): boolean {
	return SCHEME.test(value) || PROTOCOL_RELATIVE.test(value);
}

function render(parts: readonly Part[]): string {
	const result = parts
		.map((part) =>
			part.type === 'text'
				? part.value
				: part.type === 'resolved'
					? part.label.replace('()', '(…)')
					: part.type === 'based'
						? `{${part.label}}`
						: '…'
		)
		.join('');
	return result.length > 60 ? `${result.slice(0, 59)}…` : result;
}

function classify(alt: Alt): Finding {
	if (alt === null) return OK;
	// Browsers remove tabs and newlines anywhere, and spaces at the end.
	const parts = alt
		.map((part, index) =>
			part.type === 'text'
				? {
						type: 'text' as const,
						value:
							index === alt.length - 1
								? part.value.replace(/[\t\n\r]/gu, '').replace(TRAILING_IGNORED, '')
								: part.value.replace(/[\t\n\r]/gu, '')
					}
				: part
		)
		.filter((part) => part.type !== 'text' || part.value !== '');
	while (parts.length > 0 && parts[0].type === 'text') {
		const value = parts[0].value.replace(LEADING_IGNORED, '');
		if (value !== '') {
			parts[0] = { type: 'text', value };
			break;
		}
		parts.shift();
	}
	// `''`: the current page.
	if (parts.length === 0) return OK;

	const value = render(parts);
	const anchorIndex = parts.findIndex((part) => part.type === 'resolved' || part.type === 'based');
	const anchor = parts[anchorIndex] as Extract<Part, { type: 'resolved' | 'based' }> | undefined;
	// `?next={resolve('/x')}`: an anchor inside the query or the hash does not decide the path.
	const insideQueryOrHash = parts
		.slice(0, Math.max(anchorIndex, 0))
		.some((part) => part.type === 'text' && /[#?]/u.test(part.value));
	if (anchor && anchorIndex > 0 && !insideQueryOrHash) {
		const head = parts[0];
		return {
			kind: 'prefix',
			value,
			name: anchor.label,
			// `page.url` is always absolute. `resolve()`, `asset()`, `base` and `assets` can be
			// relative during server rendering.
			relativeInSsr:
				anchor.type === 'resolved' || anchor.label === 'base' || anchor.label === 'assets',
			head:
				head.type === 'text'
					? isExternalText(head.value)
						? 'external'
						: 'text'
					: head.type === 'unknown' && head.origin
						? 'origin'
						: 'unknown'
		};
	}
	if (anchor && anchorIndex === 0) {
		if (anchor.type === 'based') {
			// `{base}{resolve('/x')}`: the base path is added twice.
			for (const part of parts.slice(1)) {
				if (part.type === 'text' && /[#?]/u.test(part.value)) break;
				if (part.type === 'resolved') {
					return { kind: 'prefix', value, name: part.label, relativeInSsr: false, head: 'text' };
				}
			}
			return OK;
		}
		const next = parts[1];
		if (next === undefined) return OK;
		// `asset()` only adds a prefix: there is no route check to bypass.
		if (anchor.label === 'asset()') return OK;
		if (next.type === 'text') {
			return /^[#?]/u.test(next.value) ? OK : { kind: 'appended', value, name: anchor.label };
		}
		if (next.type === 'unknown') return { kind: 'unknownSuffix', name: anchor.label };
		return { kind: 'appended', value, name: anchor.label };
	}

	const head = parts[0];
	if (head.type !== 'text') return { kind: 'unknown' };
	const complete = parts.length === 1;
	if (/^[#?]/u.test(head.value)) return OK;
	if (isExternalText(head.value)) return { kind: 'external', value };
	if (/^[/\\]/u.test(head.value)) return { kind: 'rootRelative', value, complete };
	// `'http' + rest` may still become an absolute URL.
	if (!complete && SCHEME_PREFIX.test(head.value)) return { kind: 'unknown' };
	return { kind: 'pathRelative', value };
}

// ---------------------------------------------------------------------------
// Evaluator
// ---------------------------------------------------------------------------

type ImportInfo = { source: string; imported: string | '*' };

type SourceRef =
	| { readonly type: 'node'; readonly node: TSESTree.Expression }
	| { readonly type: 'absent' }
	| { readonly type: 'unknown' };

const UNKNOWN_SOURCE: SourceRef = { type: 'unknown' };
const ABSENT_SOURCE: SourceRef = { type: 'absent' };

const PATTERN_PARENTS = new Set([
	'Property',
	'ObjectPattern',
	'ArrayPattern',
	'AssignmentPattern',
	'RestElement'
]);

function getImportInfo(variable: Variable): ImportInfo | null {
	const def = variable.defs[0];
	// `import x = require('...')` / `import x = NS.y` is also an `ImportBinding`.
	if (def?.type !== 'ImportBinding' || def.parent?.type !== 'ImportDeclaration') return null;
	const declaration = def.parent;
	const node = def.node as TSESTree.ImportClause;
	const source = declaration.source.value;
	if (node.type === 'ImportNamespaceSpecifier') return { source, imported: '*' };
	if (node.type === 'ImportDefaultSpecifier') return { source, imported: 'default' };
	return {
		source,
		imported: node.imported.type === 'Identifier' ? node.imported.name : String(node.imported.value)
	};
}

function containsNode(pattern: TSESTree.Node, target: TSESTree.Node): boolean {
	return pattern.range[0] <= target.range[0] && target.range[1] <= pattern.range[1];
}

/** The innermost scope that contains `node`. */
function scopeOf(context: RuleContext, node: TSESTree.Node) {
	return getInnermostScope(getScope(context, node), node);
}

function arrayIndex(key: string): number | null {
	const index = Number(key);
	return Number.isInteger(index) && index >= 0 && String(index) === key ? index : null;
}

function isRuneCall(context: RuleContext, node: TSESTree.Node, names: string[]): boolean {
	if (node.type !== 'CallExpression') return false;
	const callee = node.callee;
	let name: string, root: TSESTree.Identifier;
	if (callee.type === 'Identifier') {
		name = callee.name;
		root = callee;
	} else if (
		callee.type === 'MemberExpression' &&
		!callee.computed &&
		callee.object.type === 'Identifier' &&
		callee.property.type === 'Identifier'
	) {
		name = `${callee.object.name}.${callee.property.name}`;
		root = callee.object;
	} else {
		return false;
	}
	if (!names.includes(name)) return false;
	const variable = findVariable(context, root);
	return variable === null || variable.defs.length === 0;
}

class UrlEvaluator {
	private depth = 0;

	/**
	 * The lowest stack depth that a guard cut the current evaluation off at. A result that was
	 * cut off only at its own frame or deeper does not depend on the frames above, so it can be
	 * cached.
	 */
	private lowestCut = Infinity;

	private readonly evaluating = {
		active: new Map<unknown, number>(),
		cache: new Map<unknown, Value>(),
		size: (value: Value) => value.length,
		provisional: new Map<unknown, Value>()
	};

	private readonly variableValues = {
		active: new Map<Variable, number>(),
		cache: new Map<Variable, { value: Value; unknown: boolean }>(),
		size: (result: { value: Value; unknown: boolean }) =>
			result.value.length + Number(result.unknown),
		provisional: new Map<Variable, { value: Value; unknown: boolean }>()
	};

	private readonly candidateSearch = {
		active: new Map<TSESTree.Node, number>(),
		cache: new Map<TSESTree.Node, SourceRef[]>()
	};

	private readonly variableCandidates = {
		active: new Map<Variable, number>(),
		cache: new Map<Variable, SourceRef[] | null>()
	};

	private readonly memberValues = {
		active: new Map<string, number>(),
		cache: new Map<string, { value: Value; unknown: boolean }>(),
		size: (result: { value: Value; unknown: boolean }) =>
			result.value.length + Number(result.unknown),
		provisional: new Map<string, { value: Value; unknown: boolean }>()
	};

	private readonly lookups = {
		active: new Map<string, number>(),
		cache: new Map<string, SourceRef[]>()
	};

	private readonly ids = new Map<TSESTree.Node | Variable, number>();

	/** The number of computations left for the current URL. */
	private budget = 0;

	/** The keys that were found in a cycle with themselves. */
	private readonly selfHits = new Set<unknown>();

	/** Whether the depth limit cut the current evaluation off. */
	private limited = false;

	/** Results that are valid only for the current URL. */
	private readonly temporaryCaches = new Map<object, Map<unknown, unknown>>();

	/**
	 * Run `compute` for `key` once: return the cached result if there is one, `onCycle` when
	 * `key` is already being computed, and `onLimit` when the stack is too deep.
	 */
	private guard<K, T>(
		state: {
			active: Map<K, number>;
			cache: Map<K, T>;
			/** For a value that depends on itself: the size, to repeat until it stops growing. */
			size?: (value: T) => number;
			provisional?: Map<K, T>;
		},
		key: K,
		onCycle: T,
		onLimit: T,
		compute: () => T
	): T {
		if (state.cache.has(key)) return state.cache.get(key)!;
		const temporary = this.temporaryCaches.get(state);
		if (temporary?.has(key)) return temporary.get(key) as T;
		// At the depth limit, give up.
		if (this.depth >= MAX_DEPTH) {
			this.limited = true;
			return onLimit;
		}
		const active = state.active.get(key);
		if (active !== undefined) {
			// A value that depends on itself adds nothing new (the least fixed point), or what was
			// found so far while repeating.
			this.lowestCut = Math.min(this.lowestCut, active);
			this.selfHits.add(key);
			return state.provisional?.has(key) ? state.provisional.get(key)! : onCycle;
		}
		if (--this.budget < 0) throw OUT_OF_BUDGET;
		this.selfHits.delete(key);
		const depth = this.depth;
		const outer = this.lowestCut;
		const outerLimited = this.limited;
		state.active.set(key, depth);
		this.depth++;
		this.lowestCut = Infinity;
		this.limited = false;
		try {
			let result = compute();
			// `a = b ?? '/x'; b = a`: repeat with the value found so far until it stops growing.
			if (state.size && state.provisional) {
				// Repeat whenever the value depended on itself, even when an outer value is also cut.
				for (let round = 0; round < 4 && this.selfHits.has(key); round++) {
					this.selfHits.delete(key);
					const size = state.size(result);
					state.provisional.set(key, result);
					this.lowestCut = Infinity;
					const next = compute();
					const grew = state.size(next) > size;
					result = next;
					if (!grew) break;
				}
				state.provisional.delete(key);
				this.selfHits.delete(key);
			}
			if (this.lowestCut >= depth) {
				// A result cut by the depth limit depends on where the evaluation started, so it is
				// reused only for the current URL (this keeps long chains linear).
				if (!this.limited) {
					state.cache.set(key, result);
				} else {
					let map = this.temporaryCaches.get(state);
					if (!map) this.temporaryCaches.set(state, (map = new Map()));
					map.set(key, result);
				}
			}
			return result;
		} finally {
			this.depth--;
			state.active.delete(key);
			this.lowestCut = Math.min(outer, this.lowestCut);
			this.limited = outerLimited || this.limited;
		}
	}

	private readonly propertyNameCache = new Map<
		TSESTree.ObjectExpression,
		{ names: (string | null)[]; index: Map<string, number> | null }
	>();

	private resolvedPathnameType: TS.Type | null | undefined = undefined;

	private readonly context: RuleContext;

	private readonly tsTools: TSTools | null;

	public constructor(context: RuleContext, tsTools: TSTools | null) {
		this.context = context;
		this.tsTools = tsTools;
	}

	/** Evaluate the URL of a sink. Gives up (unknown) on code that is too complex. */
	public evaluateUrl(node: TSESTree.Node | AST.SvelteLiteral): Value {
		this.budget = MAX_COMPUTATIONS;
		this.temporaryCaches.clear();
		try {
			return this.evaluate(node);
		} catch (error) {
			if (error !== OUT_OF_BUDGET) throw error;
			return UNKNOWN_STRING;
		}
	}

	private evaluate(node: TSESTree.Node | AST.SvelteLiteral): Value {
		// At the depth limit, the value is a non-nullish unknown so that `??` / `||` fallbacks
		// are not reported because of the limit.
		return this.guard(this.evaluating, node, [], UNKNOWN_STRING, () => this.evaluateNode(node));
	}

	private evaluateNode(node: TSESTree.Node | AST.SvelteLiteral): Value {
		switch (node.type) {
			case 'SvelteLiteral':
				return text(node.value);
			case 'Literal':
				if (typeof node.value === 'string') return text(node.value);
				if (node.raw === 'null') return NULLISH;
				if (
					typeof node.value === 'number' ||
					typeof node.value === 'boolean' ||
					typeof node.value === 'bigint'
				)
					return text(String(node.value));
				return UNKNOWN;
			case 'TemplateLiteral': {
				const values: Value[] = [];
				node.quasis.forEach((quasi, index) => {
					values.push(text(quasi.value.cooked ?? quasi.value.raw));
					const expression = node.expressions[index];
					if (expression) values.push(this.evaluate(expression));
				});
				return concat(values);
			}
			case 'BinaryExpression': {
				if (node.operator === '+') {
					return concat([this.evaluate(node.left), this.evaluate(node.right)]);
				}
				const result = getStaticValue(node, scopeOf(this.context, node));
				if (result !== null) {
					const value = result.value;
					if (value === null || value === undefined) return NULLISH;
					if (['string', 'number', 'boolean', 'bigint'].includes(typeof value))
						return text(String(value));
				}
				return this.refine(node);
			}
			case 'LogicalExpression': {
				// `0 || x`, `false || x`, `null ?? x` (a member may be changed later)
				const known =
					node.left.type === 'MemberExpression' || node.left.type === 'ChainExpression'
						? null
						: getStaticValue(node.left, scopeOf(this.context, node.left));
				if (known !== null) {
					const value = known.value;
					const useRight =
						node.operator === '??'
							? value == null
							: node.operator === '||'
								? !value
								: Boolean(value);
					return this.evaluate(useRight ? node.right : node.left);
				}
				const left = this.evaluate(node.left);
				if (node.operator === '??') {
					return mayBeNullish(left) ? union(withoutNullish(left), this.evaluate(node.right)) : left;
				}
				if (node.operator === '||') {
					return mayBeFalsy(left)
						? union(
								left.filter((alt) => alt !== null && alt.length > 0),
								this.evaluate(node.right)
							)
						: left;
				}
				// `&&`: the right side is used only when the left side may be truthy.
				const truthy = left.some((alt) => alt !== null && alt.length > 0);
				const right = truthy ? this.evaluate(node.right) : [];
				return mayBeFalsy(left)
					? union(
							left.filter((alt) => alt !== null && alt.length === 0),
							left.some((alt) => alt === null || alt.some((part) => part.type === 'unknown'))
								? NULLISH
								: [],
							right
						)
					: right;
			}
			case 'ConditionalExpression': {
				const test =
					node.test.type === 'MemberExpression' || node.test.type === 'ChainExpression'
						? null
						: getStaticValue(node.test, scopeOf(this.context, node.test));
				if (test !== null) return this.evaluate(test.value ? node.consequent : node.alternate);
				return union(this.evaluate(node.consequent), this.evaluate(node.alternate));
			}
			case 'AwaitExpression': {
				const value = this.refine(node);
				return this.isCallResult(node) ? untrustLiterals(value) : value;
			}
			case 'SequenceExpression':
				return this.evaluate(node.expressions[node.expressions.length - 1]);
			case 'TSAsExpression':
			case 'TSTypeAssertion':
				// An explicit `as ResolvedPathname` is a deliberate escape hatch.
				return this.isResolvedPathnameAssertion(node) ? RESOLVED : this.evaluate(node.expression);
			case 'TSNonNullExpression':
				return withoutNullish(this.evaluate(node.expression));
			case 'TSSatisfiesExpression':
			case 'TSInstantiationExpression':
			case 'ChainExpression':
				return this.evaluate(node.expression);
			case 'AssignmentExpression':
				return node.operator === '=' ? this.evaluate(node.right) : this.refine(node);
			case 'Identifier':
				return this.evaluateIdentifier(node);
			case 'MemberExpression':
				return this.evaluateMember(node);
			case 'CallExpression':
				return this.evaluateCall(node);
			case 'NewExpression':
				return this.evaluateNew(node);
			default:
				return this.refine(node);
		}
	}

	private evaluateIdentifier(node: TSESTree.Identifier): Value {
		const variable = findVariable(this.context, node);
		if (variable === null || variable.defs.length === 0) {
			return node.name === 'undefined' ? NULLISH : this.refine(node);
		}
		const info = getImportInfo(variable);
		if (info?.source === '$app/paths' && (info.imported === 'base' || info.imported === 'assets')) {
			return based(info.imported);
		}
		// `$store` reads the value of the store, not the store itself.
		if (variable.name !== node.name) return this.refine(node);
		// `const href: ResolvedPathname = ...` is a deliberate escape hatch, like a cast.
		const declared = variable.defs[0].name as TSESTree.Identifier;
		const annotation = declared.typeAnnotation?.typeAnnotation;
		if (annotation && this.isResolvedPathnameTypeNode(annotation, declared)) {
			return mayBeNullish(this.refine(declared)) ? union(RESOLVED, NULLISH) : RESOLVED;
		}
		// `url.pathname = ...` changes the value.
		if (isMutated(this.context, variable, this.holds(variable))) return this.refine(node);
		const result = this.guard(
			this.variableValues,
			variable,
			{ value: [], unknown: false },
			{ value: UNKNOWN_STRING, unknown: false },
			() => {
				const sources = this.variableSources(variable);
				if (sources === null) return { value: [], unknown: true };
				return {
					value: union(
						...sources.map((source) =>
							source.type === 'node'
								? this.evaluate(source.node)
								: source.type === 'absent'
									? NULLISH
									: []
						)
					),
					unknown: sources.some((source) => source.type === 'unknown')
				};
			}
		);
		// The type at this reference (which may be narrowed) tells more about unknown values.
		if (!result.unknown) return result.value;
		const refined = this.refine(node);
		return union(result.value, this.isCallResult(node) ? untrustLiterals(refined) : refined);
	}

	/**
	 * Every value that is assigned to the variable, or null if the variable is not a
	 * local variable that can be followed (an import, a parameter, a global...).
	 */
	private variableSources(variable: Variable): SourceRef[] | null {
		const def = variable.defs[0];
		// `var x = ...; var x = ...` declares it more than once.
		if (def === undefined || def.type === 'ImportBinding' || variable.defs.length > 1) return null;
		const name = def.name as TSESTree.Identifier;
		const each = eachBlockOf(name);
		if (each !== null) return this.eachSources(each, name);
		if (def.type !== 'Variable' || def.node.type !== 'VariableDeclarator') return null;

		const declarator = def.node;
		const declaration = declarator.parent;
		// `declare const x: '/a'` has no value in this file.
		if (declaration.declare) return null;
		const loop = declaration.parent;
		if (
			(loop.type === 'ForOfStatement' || loop.type === 'ForInStatement') &&
			loop.left === declaration
		) {
			return null;
		}

		const sources: SourceRef[] = [];
		const init = declarator.init ? this.unwrapRune(declarator.init) : ABSENT_SOURCE;
		if (declarator.id === name) sources.push(init);
		else sources.push(...this.patternSources(declarator.id, name, init));
		// Svelte 4 props: `export let href = '/'`.
		if (declaration.parent.type === 'ExportNamedDeclaration' && declaration.kind !== 'const') {
			sources.push(UNKNOWN_SOURCE);
		}
		for (const ref of variable.references) {
			if (ref.init || !ref.isWrite()) continue;
			const parent = ref.identifier.parent;
			if (
				parent?.type === 'AssignmentExpression' &&
				parent.left === ref.identifier &&
				(parent.operator === '=' || parent.operator === '??=' || parent.operator === '||=')
			) {
				sources.push({ type: 'node', node: parent.right });
			} else {
				sources.push(UNKNOWN_SOURCE);
			}
		}
		return sources;
	}

	/** `$state(x)` -> `x`, `$props()` -> unknown. */
	private unwrapRune(node: TSESTree.Expression): SourceRef {
		if (isRuneCall(this.context, node, ['$state', '$state.raw', '$derived', '$bindable'])) {
			const arg = (node as TSESTree.CallExpression).arguments[0];
			if (arg === undefined) return ABSENT_SOURCE;
			return arg.type === 'SpreadElement' ? UNKNOWN_SOURCE : { type: 'node', node: arg };
		}
		if (isRuneCall(this.context, node, ['$derived.by'])) {
			const fn = (node as TSESTree.CallExpression).arguments[0];
			if (fn?.type === 'ArrowFunctionExpression' && fn.body.type !== 'BlockStatement') {
				return { type: 'node', node: fn.body };
			}
			return UNKNOWN_SOURCE;
		}
		if (isRuneCall(this.context, node, ['$props', '$state.snapshot'])) return UNKNOWN_SOURCE;
		return { type: 'node', node };
	}

	/** The values that `target` receives when `source` is destructured by `pattern`. */
	private patternSources(
		pattern: TSESTree.Node,
		target: TSESTree.Identifier,
		source: SourceRef
	): SourceRef[] {
		if (pattern === target) return [source];
		switch (pattern.type) {
			case 'AssignmentPattern': {
				const defaultSource = this.unwrapRune(pattern.right);
				let sources: SourceRef[];
				if (source.type === 'absent') sources = [defaultSource];
				else if (source.type === 'unknown' || this.mayBeUndefined(source.node))
					sources = [source, defaultSource];
				else sources = [source];
				return sources.flatMap((s) => this.patternSources(pattern.left, target, s));
			}
			case 'ObjectPattern': {
				for (const property of pattern.properties) {
					if (!containsNode(property, target)) continue;
					if (property.type === 'RestElement') return [UNKNOWN_SOURCE];
					const key = getPropertyName(property, scopeOf(this.context, property));
					const subs =
						key === null || source.type !== 'node'
							? [UNKNOWN_SOURCE]
							: this.lookup(source.node, key);
					return subs.flatMap((s) => this.patternSources(property.value, target, s));
				}
				return [UNKNOWN_SOURCE];
			}
			case 'ArrayPattern': {
				for (const [index, element] of pattern.elements.entries()) {
					if (element === null || !containsNode(element, target)) continue;
					if (element.type === 'RestElement') return [UNKNOWN_SOURCE];
					const subs =
						source.type !== 'node' ? [UNKNOWN_SOURCE] : this.lookup(source.node, String(index));
					return subs.flatMap((s) => this.patternSources(element, target, s));
				}
				return [UNKNOWN_SOURCE];
			}
			default:
				return [UNKNOWN_SOURCE];
		}
	}

	private mayBeUndefined(node: TSESTree.Expression): boolean {
		const target = unwrapTypeScript(node);
		if (target.type === 'ObjectExpression' || target.type === 'ArrayExpression') return false;
		return mayBeNullish(this.evaluate(node));
	}

	private eachSources(each: AST.SvelteEachBlock, target: TSESTree.Identifier): SourceRef[] {
		const items = this.arrayItems(each.expression);
		const sources: SourceRef[] =
			items === null
				? [UNKNOWN_SOURCE]
				: [
						...items.items.map(
							(item): SourceRef => (item === null ? ABSENT_SOURCE : { type: 'node', node: item })
						),
						...(items.complete ? [] : [UNKNOWN_SOURCE])
					];
		return sources.flatMap((s) => this.patternSources(each.context as TSESTree.Node, target, s));
	}

	/** The expressions that `node` may evaluate to, following local variables and literals. */
	private candidates(node: TSESTree.Expression): SourceRef[] {
		return this.guard(this.candidateSearch, node, [], [UNKNOWN_SOURCE], () =>
			this.candidatesOf(node)
		);
	}

	private candidatesOf(node: TSESTree.Expression): SourceRef[] {
		if (node.type === 'Identifier') {
			const variable = findVariable(this.context, node);
			if (variable === null || variable.name !== node.name) return [{ type: 'node', node }];
			// Its properties or elements may be changed later.
			if (isMutated(this.context, variable, this.holds(variable))) return [UNKNOWN_SOURCE];
			const sources = this.guard(this.variableCandidates, variable, [], [UNKNOWN_SOURCE], () => {
				const sources = this.variableSources(variable);
				if (sources === null) return null;
				return sources
					.flatMap((s) => (s.type === 'node' ? this.candidates(s.node) : [s]))
					.slice(0, MAX_ALTS);
			});
			return sources ?? [{ type: 'node', node }];
		}
		if (node.type === 'MemberExpression') {
			const key = getPropertyName(node, scopeOf(this.context, node));
			if (key === null) return [{ type: 'node', node }];
			const found = this.lookup(node.object, key);
			if (found.length > 0 && found.every((s) => s.type === 'unknown'))
				return [{ type: 'node', node }];
			return found
				.flatMap((s) => (s.type === 'node' ? this.candidates(s.node) : [s]))
				.slice(0, MAX_ALTS);
		}
		return [{ type: 'node', node }];
	}

	/** What the variable is declared with: a URL, an object or array literal, or anything else. */
	private holds(variable: Variable): 'url' | 'object' | 'other' {
		const values: TSESTree.Expression[] = [];
		const def = variable.defs[0];
		if (def?.type === 'Variable' && def.node.type === 'VariableDeclarator' && def.node.init) {
			const init = this.unwrapRune(def.node.init);
			if (init.type === 'node') values.push(init.node);
		}
		for (const ref of variable.references) {
			const parent = ref.identifier.parent;
			if (
				ref.isWrite() &&
				parent?.type === 'AssignmentExpression' &&
				parent.left === ref.identifier &&
				parent.operator === '='
			) {
				const value = this.unwrapRune(parent.right);
				if (value.type === 'node') values.push(value.node);
			}
		}
		let url = values.length > 0;
		let object = false;
		for (const value of values.map(unwrapTypeScript)) {
			if (this.isUrlConstructor(value)) {
				object = true;
				continue;
			}
			url = false;
			if (
				value.type === 'ObjectExpression' ||
				value.type === 'ArrayExpression' ||
				(value.type as string) === 'NewExpression'
			) {
				object = true;
			}
		}
		return url ? 'url' : object ? 'object' : 'other';
	}

	private idOf(target: TSESTree.Node | Variable): number {
		let id = this.ids.get(target);
		if (id === undefined) this.ids.set(target, (id = this.ids.size));
		return id;
	}

	/** Find the values of `object[key]` where `object` is an object or array literal. */
	private lookup(object: TSESTree.Expression, key: string): SourceRef[] {
		// `x = { ...x, a: 1 }` looks itself up.
		return this.guard(this.lookups, this.lookupKey(object, key), [], [UNKNOWN_SOURCE], () =>
			this.lookupUncached(object, key)
		);
	}

	/**
	 * The key of `object[key]`. A local variable is one key for all its references, so that a
	 * cycle such as `x = { ...x, a: 1 }` is found at once.
	 */
	private lookupKey(object: TSESTree.Expression, key: string): string {
		const target = unwrapTypeScript(object);
		const variable = target.type === 'Identifier' ? findVariable(this.context, target) : null;
		const id =
			variable !== null && variable.name === (target as TSESTree.Identifier).name
				? `v${this.idOf(variable)}`
				: `n${this.idOf(object)}`;
		return `${id}:${key}`;
	}

	private lookupUncached(object: TSESTree.Expression, key: string): SourceRef[] {
		const index = arrayIndex(key);
		const results: SourceRef[] = [];
		for (const candidate of this.candidates(unwrapTypeScript(object))) {
			if (candidate.type !== 'node') {
				results.push(UNKNOWN_SOURCE);
				continue;
			}
			const target = unwrapTypeScript(candidate.node);
			if (target.type === 'ObjectExpression') results.push(...this.lookupInObject(target, key));
			else if (target.type === 'ArrayExpression' && index !== null)
				results.push(...this.lookupInArray(target, index));
			else results.push(UNKNOWN_SOURCE);
		}
		return results.slice(0, MAX_ALTS);
	}

	/**
	 * The property names of the object (null for an unknown name or a spread), and the index of
	 * the last property for each name when every name is known.
	 */
	private propertyNames(object: TSESTree.ObjectExpression): {
		names: (string | null)[];
		index: Map<string, number> | null;
	} {
		let result = this.propertyNameCache.get(object);
		if (!result) {
			const scope = scopeOf(this.context, object);
			const names = object.properties.map((property) => {
				if (property.type === 'SpreadElement') return null;
				const name = getPropertyName(property, scope);
				// `{ __proto__: ... }` sets the prototype.
				return name === '__proto__' && !property.computed ? null : name;
			});
			let index: Map<string, number> | null = new Map();
			for (const [i, name] of names.entries()) {
				if (name === null) {
					index = null;
					break;
				}
				index.set(name, i);
			}
			result = { names, index };
			this.propertyNameCache.set(object, result);
		}
		return result;
	}

	private propertySource(property: TSESTree.Property): SourceRef[] {
		return property.kind === 'init' && property.value.type !== 'AssignmentPattern'
			? [{ type: 'node', node: property.value as TSESTree.Expression }]
			: [UNKNOWN_SOURCE];
	}

	private lookupInObject(object: TSESTree.ObjectExpression, key: string): SourceRef[] {
		// Last write wins.
		const { names, index } = this.propertyNames(object);
		if (index !== null) {
			// Every name is known: only the last property with the key matters.
			const i = index.get(key);
			if (i !== undefined) return this.propertySource(object.properties[i] as TSESTree.Property);
			return key in Object.prototype ? [UNKNOWN_SOURCE] : [ABSENT_SOURCE];
		}
		let result: SourceRef[] = [ABSENT_SOURCE];
		for (const [i, property] of object.properties.entries()) {
			if (property.type === 'SpreadElement') {
				const spread = this.lookup(property.argument, key);
				const defined = spread.filter((s) => s.type !== 'absent');
				// An unknown spread may hide anything before it.
				if (spread.some((s) => s.type === 'unknown') || defined.length === spread.length) {
					result = defined;
				} else {
					result = [...result, ...defined];
				}
				continue;
			}
			const name = names[i];
			if (name === null) {
				result = [UNKNOWN_SOURCE];
			} else if (name === key) {
				result = this.propertySource(property);
			}
		}
		// Properties such as `toString` live on the prototype.
		if (result.some((s) => s.type === 'absent') && key in Object.prototype) {
			return [UNKNOWN_SOURCE];
		}
		return result;
	}

	private lookupInArray(array: TSESTree.ArrayExpression, index: number): SourceRef[] {
		let offset = 0;
		for (const element of array.elements) {
			if (element?.type === 'SpreadElement') {
				const items = this.arrayItems(element.argument);
				if (items === null) return [UNKNOWN_SOURCE];
				if (index < offset + items.items.length) {
					const item = items.items[index - offset];
					return [item === null ? ABSENT_SOURCE : { type: 'node', node: item }];
				}
				if (!items.complete) return [UNKNOWN_SOURCE];
				offset += items.items.length;
				continue;
			}
			if (offset === index) {
				return [element === null ? ABSENT_SOURCE : { type: 'node', node: element }];
			}
			offset++;
		}
		return [ABSENT_SOURCE];
	}

	/**
	 * The elements of an array literal, with spreads of other array literals expanded.
	 * `complete` is false if a spread of an unknown array was reached.
	 */
	private arrayItems(
		node: TSESTree.Expression
	): { items: (TSESTree.Expression | null)[]; complete: boolean } | null {
		const candidates = this.candidates(unwrapTypeScript(node));
		if (candidates.length !== 1 || candidates[0].type !== 'node') return null;
		const array = unwrapTypeScript(candidates[0].node);
		if (array.type !== 'ArrayExpression') return null;
		const items: (TSESTree.Expression | null)[] = [];
		for (const element of array.elements) {
			if (element === null) {
				items.push(null);
			} else if (element.type === 'SpreadElement') {
				const spread = this.depth < MAX_DEPTH ? this.arrayItems(element.argument) : null;
				if (spread === null) return { items, complete: false };
				for (const item of spread.items) {
					if (items.length >= MAX_ALTS) return { items, complete: false };
					items.push(item);
				}
				if (!spread.complete) return { items, complete: false };
			} else {
				// Only the first items matter: alternatives are capped anyway.
				if (items.length >= MAX_ALTS) return { items, complete: false };
				items.push(element);
			}
		}
		return { items, complete: true };
	}

	private evaluateMember(node: TSESTree.MemberExpression): Value {
		const key = getPropertyName(node, scopeOf(this.context, node));
		if (key === null) return this.refine(node);

		// `paths.base` with `import * as paths from '$app/paths'`
		const path = this.pathsMember(node, ['base', 'assets']);
		if (path !== null) return based(path);
		// `page.url`, `page.url.pathname`, `page.url.href`
		if (key === 'url' && this.isPage(node.object)) return based('page.url');
		if ((key === 'pathname' || key === 'href') && this.isPageUrl(node.object)) {
			return based(`page.url.${key}`);
		}
		// `page.url.search`, `url.hash`, `location.search`: empty or starting with `?` / `#`.
		if (
			(key === 'search' || key === 'hash') &&
			(this.isPageUrl(node.object) ||
				isGlobal(this.context, node.object, ['location']) ||
				this.evaluateUrlObject(node.object) !== null)
		) {
			return union(text(''), [
				[{ type: 'text', value: key === 'search' ? '?' : '#' }, STRING_PART]
			]);
		}
		if (key === 'origin' && this.isPageUrl(node.object)) {
			return [[{ type: 'unknown', string: true, origin: true }]];
		}
		// `new URL(...).href`
		if (key === 'href') {
			const url = this.evaluateUrlObject(node.object);
			if (url !== null) return url;
		}
		const result = this.guard(
			this.memberValues,
			this.lookupKey(node.object, key),
			{ value: [], unknown: false },
			{ value: UNKNOWN_STRING, unknown: false },
			() => {
				const sources = this.lookup(node.object, key);
				return {
					value: union(
						...sources.map((source) =>
							source.type === 'node'
								? this.evaluate(source.node)
								: source.type === 'absent'
									? NULLISH
									: []
						)
					),
					unknown: sources.some((source) => source.type === 'unknown')
				};
			}
		);
		if (!result.unknown) return result.value;
		// Only the type is untrusted: values found in the code are real.
		const refined = this.refine(node);
		return union(result.value, this.isCallResult(node.object) ? untrustLiterals(refined) : refined);
	}

	/**
	 * Whether the value comes from a function call (other than runes), such as `f().a` or
	 * `const { a } = f()`. Its literal type may describe the argument, not the result.
	 */
	private isCallResult(node: TSESTree.Node, depth = 0): boolean {
		if (depth > MAX_DEPTH) return false;
		const target = unwrapTypeScript(node as TSESTree.Expression);
		switch (target.type) {
			case 'CallExpression':
				return !(target.callee.type === 'Identifier' && target.callee.name.startsWith('$'));
			case 'AwaitExpression':
				return this.isCallResult(target.argument, depth + 1);
			case 'MemberExpression':
				return this.isCallResult(target.object, depth + 1);
			case 'Identifier': {
				const def = findVariable(this.context, target)?.defs[0];
				// `{#each items as item}`, `for (const item of items)` and callback parameters
				// such as `items.map((item) => ...)`: their types may come from a function result.
				if (def?.type === 'Parameter') {
					return !(def.name as TSESTree.Identifier).typeAnnotation;
				}
				if (def && eachBlockOf(def.name as TSESTree.Identifier) !== null) return true;
				if (def?.type === 'Variable' && def.node.type === 'VariableDeclarator') {
					const loop = def.node.parent.parent;
					if (
						(loop.type === 'ForOfStatement' || loop.type === 'ForInStatement') &&
						loop.left === def.node.parent
					) {
						return true;
					}
				}
				// `{#await promise then value}`
				for (let n = def?.name.parent; n; n = n.parent) {
					const type = n.type as string;
					if (type === 'SvelteAwaitThenBlock' || type === 'SvelteAwaitBlock') return true;
					if (!PATTERN_PARENTS.has(type)) break;
				}
				if (def?.type !== 'Variable' || def.node.type !== 'VariableDeclarator') return false;
				const init = def.node.init;
				return init !== null && this.isCallResult(init, depth + 1);
			}
			default:
				return false;
		}
	}

	private evaluateCall(node: TSESTree.CallExpression): Value {
		const fn = this.pathsMember(node.callee, ['resolve', 'asset', 'resolveRoute']);
		if (fn !== null) return resolved(`${fn}()`);
		// `page.url.toString()`, `new URL(...).toString()`
		if (
			node.callee.type === 'MemberExpression' &&
			node.arguments.length === 0 &&
			getPropertyName(node.callee, scopeOf(this.context, node.callee)) === 'toString'
		) {
			const object = node.callee.object;
			if (this.isPageUrl(object)) return based('page.url');
			const url = this.evaluateUrlObject(object);
			if (url !== null) return url;
		}
		// What a function returns is not known: a helper such as `<T>(href: T) => T` returns
		// the literal type of its argument even when it adds the base path.
		return untrustLiterals(this.refine(node));
	}

	private evaluateNew(node: TSESTree.NewExpression): Value {
		if (!this.isUrlConstructor(node)) return this.refine(node);
		const [input, base] = node.arguments;
		if (input === undefined || input.type === 'SpreadElement') return this.refine(node);
		const value = this.evaluate(input);
		if (base === undefined) return value;
		if (base.type === 'SpreadElement') return UNKNOWN;
		// A path keeps its meaning only against a base of this app, such as `page.url`.
		// Against an external or unknown base, it may not be a path of this app.
		const baseValue = this.evaluate(base);
		// A base that only depends on itself has no value.
		if (baseValue.length === 0) return [];
		const sameApp = baseValue.every((alt) => alt !== null && alt[0]?.type === 'based');
		if (sameApp) return value;
		return value.map((alt) => (classify(alt).kind === 'external' ? alt : [UNKNOWN_PART]));
	}

	/** If every value of `node` is `new URL(...)`, evaluate them. */
	private evaluateUrlObject(node: TSESTree.Expression): Value | null {
		const candidates = this.candidates(node);
		if (
			candidates.length === 0 ||
			!candidates.every((c) => c.type === 'node' && this.isUrlConstructor(c.node))
		) {
			return null;
		}
		return union(
			...candidates.map((c) => this.evaluate((c as { node: TSESTree.Expression }).node))
		);
	}

	private isUrlConstructor(node: TSESTree.Node): node is TSESTree.NewExpression {
		if (
			node.type !== 'NewExpression' ||
			node.callee.type !== 'Identifier' ||
			node.callee.name !== 'URL'
		) {
			return false;
		}
		const variable = findVariable(this.context, node.callee);
		return variable === null || variable.defs.length === 0;
	}

	private isPageUrl(node: TSESTree.Node): boolean {
		return (
			node.type === 'MemberExpression' &&
			getPropertyName(node, scopeOf(this.context, node)) === 'url' &&
			this.isPage(node.object)
		);
	}

	/** `page` from `$app/state`, or `$page` from `$app/stores`. */
	private isPage(node: TSESTree.Node): boolean {
		if (node.type === 'Identifier') {
			const variable = findVariable(this.context, node);
			const info = variable && getImportInfo(variable);
			if (!info || info.imported !== 'page') return false;
			if (info.source === '$app/state') return !node.name.startsWith('$');
			if (info.source === '$app/stores') return node.name.startsWith('$');
			return false;
		}
		if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
			const variable = findVariable(this.context, node.object);
			const info = variable && getImportInfo(variable);
			return (
				info?.source === '$app/state' &&
				info.imported === '*' &&
				getPropertyName(node, scopeOf(this.context, node)) === 'page'
			);
		}
		return false;
	}

	/**
	 * If `node` is one of `names` from `$app/paths` (as a named or a namespace import),
	 * returns its name.
	 */
	private pathsMember(node: TSESTree.Node, names: string[]): string | null {
		if (node.type === 'Identifier') {
			const variable = findVariable(this.context, node);
			const info = variable && getImportInfo(variable);
			return info?.source === '$app/paths' && names.includes(info.imported) ? info.imported : null;
		}
		if (node.type === 'MemberExpression' && node.object.type === 'Identifier') {
			const variable = findVariable(this.context, node.object);
			const info = variable && getImportInfo(variable);
			const key = getPropertyName(node, scopeOf(this.context, node));
			const matches =
				info?.source === '$app/paths' &&
				info.imported === '*' &&
				key !== null &&
				names.includes(key);
			return matches ? key : null;
		}
		return null;
	}

	// --- TypeScript ---------------------------------------------------------

	private isResolvedPathnameAssertion(
		node: TSESTree.TSAsExpression | TSESTree.TSTypeAssertion
	): boolean {
		return this.isResolvedPathnameTypeNode(node.typeAnnotation, node);
	}

	/**
	 * Whether `annotation` is `ResolvedPathname` (possibly nullable). `typed` is the node whose
	 * type is described by the annotation.
	 */
	private isResolvedPathnameTypeNode(annotation: TSESTree.TypeNode, typed: TSESTree.Node): boolean {
		// Without the generated `$app/types` (e.g. before `svelte-kit sync`), check the syntax.
		if (this.tsTools && this.getResolvedPathnameType() !== null) {
			const type = this.typeOf(typed);
			if (type !== null && !isAnyType(type, this.tsTools.ts))
				return this.isResolvedPathnameType(this.checker().getNonNullableType(type));
		}
		if (annotation.type !== 'TSTypeReference' || annotation.typeName.type !== 'Identifier') {
			return false;
		}
		const variable = findVariable(this.context, annotation.typeName);
		const info = variable && getImportInfo(variable);
		return info?.source === '$app/types' && info.imported === 'ResolvedPathname';
	}

	/** Use the TypeScript type to learn more about a value the AST cannot tell. */
	private refine(node: TSESTree.Node): Value {
		const type = this.typeOf(node);
		if (type === null) return UNKNOWN;
		const value = this.fromType(type);
		// A literal type is trusted only where it is declared. Elsewhere it may come from a helper
		// such as `<T>(path: T) => T`, which returns the type of its argument.
		return this.hasDeclaredType(node) ? value : untrustLiterals(value);
	}

	/**
	 * Whether the literal type of `node` is declared by the code: by a type annotation (for
	 * example of a prop or an imported constant) or by a literal value. A type that comes from a
	 * function result is not declared.
	 */
	private hasDeclaredType(node: TSESTree.Node): boolean {
		if (!this.tsTools) return false;
		const target = unwrapTypeScript(node as TSESTree.Expression);
		if (target.type === 'MemberExpression') {
			// The property of the object type (`obj[key]` would give the symbol of `key`).
			const key = getPropertyName(target, scopeOf(this.context, target));
			const object = this.tsTools.service.esTreeNodeToTSNodeMap.get(target.object as never);
			if (key === null || !object) return false;
			const type = this.checker().getTypeAtLocation(object);
			return this.isDeclaredSymbol(this.checker().getApparentType(type).getProperty(key));
		}
		if (target.type !== 'Identifier') return false;
		const variable = findVariable(this.context, target);
		// `$store` is the value of a store: its type comes from the store.
		if (variable === null || variable.name !== target.name) return false;
		const def = variable.defs[0];
		if (def === undefined) return false;
		if (def.type === 'ImportBinding') {
			const tsNode = this.tsTools.service.esTreeNodeToTSNodeMap.get(target as never) as TS.Node;
			return this.isDeclaredSymbol(this.checker().getSymbolAtLocation(tsNode));
		}
		if (def.type !== 'Parameter' && def.type !== 'Variable') return false;
		const name = def.name as TSESTree.Identifier;
		if (name.typeAnnotation) {
			// `h: typeof HOME` is declared only if `HOME` is.
			const annotation = this.tsTools.service.esTreeNodeToTSNodeMap.get(
				name.typeAnnotation.typeAnnotation as never
			);
			return annotation !== undefined && this.isDeclaredTypeNode(annotation as TS.TypeNode);
		}
		// `let { a }: Props = $props()`: the type of the property `a` of `Props`.
		const property = name.parent;
		if (
			property?.type === 'Property' &&
			property.value === name &&
			property.parent.type === 'ObjectPattern'
		) {
			const key = getPropertyName(property, scopeOf(this.context, property));
			const pattern = this.tsTools.service.esTreeNodeToTSNodeMap.get(property.parent as never);
			const type = pattern ? this.checker().getTypeAtLocation(pattern) : null;
			return key !== null && this.isDeclaredSymbol(type?.getProperty(key));
		}
		return false;
	}

	/** Whether a type annotation is written out (not a type parameter such as `T`). */
	private isDeclaredTypeNode(node: TS.TypeNode, depth = 0): boolean {
		const ts = this.tsTools!.ts;
		const checker = this.checker();
		if (depth > MAX_DEPTH) return false;
		// `typeof X`: declared only if `X` is.
		if (ts.isTypeQueryNode(node)) {
			return this.isDeclaredSymbol(checker.getSymbolAtLocation(node.exprName), depth + 1);
		}
		if (ts.isTypeReferenceNode(node)) {
			const type = checker.getTypeFromTypeNode(node);
			if (type.flags & ts.TypeFlags.TypeParameter) return false;
			// `type Route = (typeof ROUTES)[keyof typeof ROUTES]`
			let symbol = checker.getSymbolAtLocation(node.typeName);
			if (symbol && symbol.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
			const alias = symbol?.declarations?.find(ts.isTypeAliasDeclaration);
			if (alias && !this.isDeclaredTypeNode(alias.type, depth + 1)) return false;
		}
		let declared = true;
		ts.forEachChild(node, (child) => {
			if (declared && ts.isTypeNode(child) && !this.isDeclaredTypeNode(child, depth + 1)) {
				declared = false;
			}
		});
		return declared;
	}

	/**
	 * Whether an object or array literal is written where its type is kept, such as the value of
	 * a variable, not an argument of a function that may change it.
	 */
	private isWrittenOutLiteral(node: TS.Node): boolean {
		const ts = this.tsTools!.ts;
		let current = node;
		for (;;) {
			const parent = current.parent;
			if (
				ts.isParenthesizedExpression(parent) ||
				ts.isObjectLiteralExpression(parent) ||
				ts.isArrayLiteralExpression(parent) ||
				ts.isPropertyAssignment(parent) ||
				((ts.isAsExpression(parent) || ts.isSatisfiesExpression(parent)) &&
					ts.isConstTypeReference(parent.type))
			) {
				current = parent;
				continue;
			}
			return (
				(ts.isVariableDeclaration(parent) && parent.initializer === current) ||
				(ts.isPropertyDeclaration(parent) && parent.initializer === current) ||
				ts.isReturnStatement(parent) ||
				(ts.isArrowFunction(parent) && parent.body === current) ||
				ts.isExportAssignment(parent)
			);
		}
	}

	/** Whether a TypeScript expression is a literal (its type is what is written). */
	private isLiteralValue(node: TS.Expression): boolean {
		const ts = this.tsTools!.ts;
		let current = node;
		while (ts.isParenthesizedExpression(current)) current = current.expression;
		// `x satisfies T` keeps the type of `x`.
		if (ts.isSatisfiesExpression(current)) return this.isLiteralValue(current.expression);
		if (ts.isAsExpression(current)) {
			// `x as const` keeps the type of `x`. `x as '/a'` declares it, `x as T` does not.
			return ts.isConstTypeReference(current.type)
				? this.isLiteralValue(current.expression)
				: this.isDeclaredTypeNode(current.type);
		}
		// Every value inside must be written out too.
		if (ts.isObjectLiteralExpression(current)) {
			return current.properties.every(
				(property) => ts.isPropertyAssignment(property) && this.isLiteralValue(property.initializer)
			);
		}
		if (ts.isArrayLiteralExpression(current)) {
			return current.elements.every(
				(element) => !ts.isSpreadElement(element) && this.isLiteralValue(element)
			);
		}
		return (
			ts.isStringLiteral(current) ||
			ts.isNoSubstitutionTemplateLiteral(current) ||
			ts.isNumericLiteral(current) ||
			current.kind === ts.SyntaxKind.TrueKeyword ||
			current.kind === ts.SyntaxKind.FalseKeyword ||
			current.kind === ts.SyntaxKind.NullKeyword
		);
	}

	/** Whether every declaration of the symbol has a type annotation or a literal value. */
	private isDeclaredSymbol(symbol: TS.Symbol | undefined, depth = 0): boolean {
		if (depth > MAX_DEPTH) return false;
		const ts = this.tsTools!.ts;
		let target = symbol;
		if (target && target.flags & ts.SymbolFlags.Alias) {
			target = this.checker().getAliasedSymbol(target);
		}
		const declarations = target?.declarations ?? [];
		return (
			declarations.length > 0 &&
			declarations.every((declaration) => {
				if (
					ts.isVariableDeclaration(declaration) ||
					ts.isPropertySignature(declaration) ||
					ts.isPropertyDeclaration(declaration) ||
					ts.isParameter(declaration)
				) {
					if (declaration.type) return this.isDeclaredTypeNode(declaration.type, depth + 1);
					const initializer =
						'initializer' in declaration ? (declaration.initializer as TS.Expression) : undefined;
					return initializer !== undefined && this.isLiteralValue(initializer);
				}
				// `{ a: '/a' }`, but not `f({ a: '/a' })`, whose result may differ.
				if (ts.isPropertyAssignment(declaration)) {
					return (
						this.isLiteralValue(declaration.initializer) &&
						this.isWrittenOutLiteral(declaration.parent)
					);
				}
				return false;
			})
		);
	}

	private checker(): TS.TypeChecker {
		return this.tsTools!.service.program.getTypeChecker();
	}

	private typeOf(node: TSESTree.Node): TS.Type | null {
		if (!this.tsTools) return null;
		const tsNode = this.tsTools.service.esTreeNodeToTSNodeMap.get(node as never);
		if (!tsNode) return null;
		return this.checker().getTypeAtLocation(tsNode);
	}

	private fromType(type: TS.Type): Value {
		const ts = this.tsTools!.ts;
		if (isAnyType(type, ts) || isUnknownType(type, ts)) return UNKNOWN;
		const nullish: Value[] = [];
		const others: TS.Type[] = [];
		for (const t of type.isUnion() ? type.types : [type]) {
			if (isNullType(t, ts) || isUndefinedType(t, ts) || isVoidType(t, ts)) nullish.push(NULLISH);
			else others.push(t);
		}
		if (others.length === 0) return union(...nullish);
		const nonNullable = this.checker().getNonNullableType(type);
		if (this.isResolvedPathnameType(nonNullable)) return union(...nullish, RESOLVED);
		if (this.isResolvedUrlType(nonNullable)) return union(...nullish, based('URL'));
		// Only plain string literal types are trusted. Template literal types such as
		// `/${string}` describe a shape, not a value.
		if (others.every((t) => t.isStringLiteral())) {
			return union(...nullish, ...others.map((t) => text(t.value)));
		}
		const stringLike = others.every((t) => t.flags & ts.TypeFlags.StringLike);
		return union(...nullish, stringLike ? UNKNOWN_STRING : UNKNOWN);
	}

	private getResolvedPathnameType(): TS.Type | null {
		if (this.resolvedPathnameType !== undefined) return this.resolvedPathnameType;
		const checker = this.checker();
		const module = checker.getAmbientModules().find((m) => m.name === '"$app/types"');
		const symbol =
			module && checker.getExportsOfModule(module).find((e) => e.name === 'ResolvedPathname');
		this.resolvedPathnameType = symbol ? checker.getDeclaredTypeOfSymbol(symbol) : null;
		return this.resolvedPathnameType;
	}

	private isResolvedPathnameType(type: TS.Type): boolean {
		const ts = this.tsTools!.ts;
		if (isAnyType(type, ts) || isUnknownType(type, ts) || type.flags & ts.TypeFlags.Never) {
			return false;
		}
		const resolvedPathname = this.getResolvedPathnameType();
		if (resolvedPathname === null) return false;
		const checker = this.checker();
		// `Pathname` is assignable to `ResolvedPathname` too, so check both directions.
		return (
			checker.isTypeAssignableTo(type, resolvedPathname) &&
			checker.isTypeAssignableTo(resolvedPathname, type)
		);
	}

	/** `URL & { pathname: ResolvedPathname }` */
	private isResolvedUrlType(type: TS.Type): boolean {
		const checker = this.checker();
		const href = type.getProperty('href');
		const pathname = type.getProperty('pathname');
		if (!href || !pathname) return false;
		const declaration = pathname.valueDeclaration ?? pathname.declarations?.[0];
		const pathnameType = declaration
			? checker.getTypeOfSymbolAtLocation(pathname, declaration)
			: null;
		return pathnameType !== null && this.isResolvedPathnameType(pathnameType);
	}
}

const MUTATING_METHODS = new Set([
	'push',
	'pop',
	'shift',
	'unshift',
	'splice',
	'sort',
	'reverse',
	'fill',
	'copyWithin',
	'set',
	'delete',
	'clear'
]);

/** Methods that do not change the object and do not give out its elements. */
const READ_ONLY_METHODS = new Set([
	'join',
	'includes',
	'indexOf',
	'lastIndexOf',
	'has',
	'toString',
	'toJSON',
	'startsWith',
	'endsWith',
	'trim',
	'toLowerCase',
	'toUpperCase'
]);

/** Functions that only read their arguments and do not give out their elements. */
const READ_ONLY_FUNCTIONS = new Set([
	'goto',
	'pushState',
	'replaceState',
	'preloadData',
	'preloadCode',
	'resolve',
	'asset',
	'String',
	'Number',
	'Boolean',
	'URL',
	'URLSearchParams',
	'encodeURIComponent',
	'encodeURI',
	'JSON.stringify',
	'Object.keys',
	'Array.isArray',
	'console.log',
	'console.warn',
	'console.error',
	'console.info',
	'console.debug'
]);

const TRANSPARENT_PARENTS = new Set([
	'TSAsExpression',
	'TSSatisfiesExpression',
	'TSNonNullExpression',
	'TSTypeAssertion',
	'ChainExpression',
	'AwaitExpression'
]);

/**
 * Whether a property or an element of the variable may be changed somewhere, e.g. `x.a = 1`,
 * `x[0]++`, `delete x.a`, `x.push(1)`, `bind:value={x.a}`. For a variable that holds an object,
 * any use that may give the object (or a part of it) to other code also counts, e.g.
 * `f(x)`, `x.map(...)` or `const y = x` when `y` is changed.
 */
function isMutated(
	context: RuleContext,
	variable: Variable,
	holds: 'url' | 'object' | 'other',
	visited = new Set<Variable>()
): boolean {
	if (visited.has(variable)) return false;
	visited.add(variable);
	return variable.references.some((ref) => {
		if (ref.init || (ref.isWrite() && !ref.isRead())) return false;
		let node: TSESTree.Node = ref.identifier;
		let parent = node.parent as TSESTree.Node | undefined;
		let member = false;
		let last: string | null = null;
		while (parent) {
			if (TRANSPARENT_PARENTS.has(parent.type)) {
				node = parent;
			} else if (parent.type === 'MemberExpression' && parent.object === node) {
				member = true;
				last =
					parent.property.type === 'Identifier' && !parent.computed ? parent.property.name : null;
				// `url.searchParams.set(...)` only changes the query.
				if (holds === 'url' && last === 'searchParams') return false;
				node = parent;
			} else {
				break;
			}
			parent = node.parent as TSESTree.Node | undefined;
		}
		if (!parent) return false;
		if (member) {
			if (parent.type === 'AssignmentExpression' && parent.left === node) {
				// `url.search = ...` / `url.hash = ...` do not change the path.
				return !(holds === 'url' && (last === 'search' || last === 'hash'));
			}
			if (parent.type === 'UpdateExpression') return true;
			if (parent.type === 'UnaryExpression' && parent.operator === 'delete') return true;
			if ((parent.type as string) === 'SvelteDirective') return true;
			if (parent.type === 'CallExpression' && parent.callee === node) {
				if (last !== null && MUTATING_METHODS.has(last)) return true;
				return holds !== 'other' && (last === null || !READ_ONLY_METHODS.has(last));
			}
		}
		if (holds === 'other') {
			// `Object.assign(x, ...)`
			return (
				parent.type === 'CallExpression' &&
				parent.arguments[0] === node &&
				calleeName(parent) === 'Object.assign'
			);
		}
		return escapes(context, node, visited, 0);
	});
}

function calleeName(call: TSESTree.CallExpression | TSESTree.NewExpression): string | null {
	const callee = call.callee;
	if (callee.type === 'Identifier') return callee.name;
	if (
		callee.type === 'MemberExpression' &&
		callee.object.type === 'Identifier' &&
		callee.property.type === 'Identifier' &&
		!callee.computed
	) {
		return `${callee.object.name}.${callee.property.name}`;
	}
	return null;
}

/** Whether the object `node` (or a part of it) may be given to code that changes it. */
function escapes(
	context: RuleContext,
	node: TSESTree.Node,
	visited: Set<Variable>,
	depth: number
): boolean {
	if (depth > MAX_DEPTH) return true;
	const parent = node.parent as TSESTree.Node | undefined;
	if (!parent) return false;

	/** Whether a variable declared by `target` is changed. */
	function declared(target: TSESTree.Node) {
		return context.sourceCode
			.getDeclaredVariables(target as never)
			.some((v) => isMutated(context, v, 'object', visited));
	}

	switch (parent.type as string) {
		case 'TSAsExpression':
		case 'TSSatisfiesExpression':
		case 'TSNonNullExpression':
		case 'TSTypeAssertion':
		case 'ChainExpression':
		case 'AwaitExpression':
		case 'LogicalExpression':
			return escapes(context, parent, visited, depth + 1);
		case 'ConditionalExpression':
			return (
				(parent as TSESTree.ConditionalExpression).test !== node &&
				escapes(context, parent, visited, depth + 1)
			);
		case 'SequenceExpression': {
			const expressions = (parent as TSESTree.SequenceExpression).expressions;
			return (
				expressions[expressions.length - 1] === node && escapes(context, parent, visited, depth + 1)
			);
		}
		case 'MemberExpression': {
			const member = parent as TSESTree.MemberExpression;
			if (member.object !== node) return false;
			// `(a ?? b).href = ...`, `(a ?? b).push(...)`
			const grand = member.parent;
			if (grand.type === 'AssignmentExpression' && grand.left === member) return true;
			if (grand.type === 'UpdateExpression') return true;
			if (grand.type === 'UnaryExpression' && grand.operator === 'delete') return true;
			if (grand.type === 'CallExpression' && grand.callee === member) {
				const name =
					member.property.type === 'Identifier' && !member.computed ? member.property.name : null;
				return name === null || !READ_ONLY_METHODS.has(name);
			}
			return escapes(context, member, visited, depth + 1);
		}
		// `{ a: x }`, `[x]`: changed only if the new object is.
		case 'Property':
			return (
				(parent as TSESTree.Property).value === node &&
				parent.parent?.type === 'ObjectExpression' &&
				escapes(context, parent.parent, visited, depth + 1)
			);
		case 'ArrayExpression':
			return escapes(context, parent, visited, depth + 1);
		// `y = x`: changed only if `y` is changed.
		case 'AssignmentExpression': {
			const assignment = parent as TSESTree.AssignmentExpression;
			if (assignment.right !== node) return false;
			if (assignment.left.type !== 'Identifier') return true;
			const target = findVariableInScope(scopeOf(context, assignment.left), assignment.left);
			return target === null || isMutated(context, target, 'object', visited);
		}
		// `const y = x` / `const { a } = x`: changed only if `y` / `a` is changed.
		case 'VariableDeclarator':
			return (parent as TSESTree.VariableDeclarator).init === node && declared(parent);
		// `for (const y of x)`
		case 'ForOfStatement':
		case 'ForInStatement': {
			const loop = parent as TSESTree.ForOfStatement;
			if (loop.right !== node) return false;
			return loop.left.type === 'VariableDeclaration' ? declared(loop.left) : true;
		}
		case 'CallExpression':
		case 'NewExpression': {
			const call = parent as TSESTree.CallExpression;
			if (call.callee === node) return false;
			const name = calleeName(call);
			return name === null || !READ_ONLY_FUNCTIONS.has(name);
		}
		// Reading it: `a + x`, `` `${x}` ``, `if (x)`, `{x}`, `{#each x as y}`...
		case 'BinaryExpression':
		case 'TemplateLiteral':
		case 'ExpressionStatement':
		case 'IfStatement':
		case 'WhileStatement':
		case 'DoWhileStatement':
		case 'ForStatement':
		case 'SwitchStatement':
		case 'SwitchCase':
		case 'SvelteIfBlock':
		case 'SvelteElseBlock':
		case 'SvelteKeyBlock':
			return false;
		// `[...x]` / `{ ...x }` copies the elements, which are still shared.
		case 'SpreadElement':
		case 'ObjectExpression':
			return escapes(context, parent, visited, depth + 1);
		// `{#each x as y}`: changed only if `y` is changed.
		case 'SvelteEachBlock': {
			const each = parent as unknown as AST.SvelteEachBlock;
			if ((each.expression as TSESTree.Node) !== node) return false;
			const names: TSESTree.Identifier[] = [];
			collectIdentifiers(each.context as TSESTree.Node, names);
			if (each.index) names.push(each.index);
			return names.some((name) => {
				const variable = findVariableInScope(scopeOf(context, name), name);
				return variable === null || isMutated(context, variable, 'object', visited);
			});
		}
		case 'UnaryExpression':
			return (parent as TSESTree.UnaryExpression).operator === 'delete';
		// `{x}` in the template, or an attribute of an HTML element (not a component).
		case 'SvelteMustacheTag':
		case 'SvelteShorthandAttribute': {
			let attribute: TSESTree.Node | undefined = parent;
			while (attribute && (attribute.type as string) !== 'SvelteStartTag') {
				attribute = attribute.parent as TSESTree.Node | undefined;
			}
			const element = attribute?.parent as AST.SvelteElement | undefined;
			// Components, `<svelte:component>` and `<svelte:self>` may change their props.
			return element !== undefined && element.kind !== 'html';
		}
		case 'SvelteAttribute':
			return false;
		default:
			return true;
	}
}

/** Collect the identifiers that a pattern declares. */
function collectIdentifiers(pattern: TSESTree.Node | null, result: TSESTree.Identifier[]): void {
	if (!pattern) return;
	switch (pattern.type) {
		case 'Identifier':
			result.push(pattern);
			break;
		case 'ObjectPattern':
			for (const property of pattern.properties) {
				collectIdentifiers(property.type === 'Property' ? property.value : property, result);
			}
			break;
		case 'ArrayPattern':
			for (const element of pattern.elements) collectIdentifiers(element, result);
			break;
		case 'RestElement':
			collectIdentifiers(pattern.argument, result);
			break;
		case 'AssignmentPattern':
			collectIdentifiers(pattern.left, result);
			break;
		default:
			break;
	}
}

/** Whether `node` is a global such as `location`, `window.location` or `globalThis.location`. */
function isGlobal(context: RuleContext, node: TSESTree.Node, names: string[]): boolean {
	let target = node;
	if (
		target.type === 'MemberExpression' &&
		!target.computed &&
		target.object.type === 'Identifier' &&
		(target.object.name === 'window' || target.object.name === 'globalThis') &&
		target.property.type === 'Identifier'
	) {
		if (!names.includes(target.property.name)) return false;
		target = target.object;
	} else if (target.type !== 'Identifier' || !names.includes(target.name)) {
		return false;
	}
	const variable = findVariableInScope(scopeOf(context, target), target.name);
	return variable === null || variable.defs.length === 0;
}

function unwrapTypeScript(node: TSESTree.Expression): TSESTree.Expression {
	let current = node;
	while (
		current.type === 'TSAsExpression' ||
		current.type === 'TSSatisfiesExpression' ||
		current.type === 'TSNonNullExpression' ||
		current.type === 'TSTypeAssertion'
	) {
		current = current.expression;
	}
	return current;
}

function eachBlockOf(node: TSESTree.Identifier): AST.SvelteEachBlock | null {
	let current: TSESTree.Node = node;
	let parent = current.parent as TSESTree.Node | AST.SvelteEachBlock | undefined;
	while (parent && PATTERN_PARENTS.has(parent.type)) {
		current = parent as TSESTree.Node;
		parent = current.parent as TSESTree.Node | AST.SvelteEachBlock | undefined;
	}
	if (parent?.type === 'SvelteEachBlock' && (parent.context as unknown) === current) return parent;
	return null;
}

// ---------------------------------------------------------------------------
// Rule
// ---------------------------------------------------------------------------

type MessageId =
	| 'rootRelative'
	| 'rootRelativeLink'
	| 'rootRelativeFile'
	| 'pathRelative'
	| 'externalUrl'
	| 'prefixBeforeResolved'
	| 'prefixBeforeBase'
	| 'preloadCodeRouteId'
	| 'appendedToResolved'
	| 'strictUnknown'
	| 'strictUnknownSuffix';

type SinkKind = 'link' | 'form' | 'call';

type Report = {
	messageId: MessageId;
	data: Record<string, string>;
	finding: Finding;
};

const PRIORITY: MessageId[] = [
	'prefixBeforeResolved',
	'prefixBeforeBase',
	'appendedToResolved',
	'externalUrl',
	'rootRelativeFile',
	'rootRelativeLink',
	'rootRelative',
	'pathRelative',
	'strictUnknownSuffix',
	'strictUnknown'
];

const FILE_EXTENSION = /\.[\da-z]+$/iu;

/** Whether a root-relative URL looks like a file, such as `/robots.txt`. */
function looksLikeFile(value: string): boolean {
	const path = value.split(/[#?]/u)[0];
	return FILE_EXTENSION.test(path);
}

const LINK_ATTRIBUTES: Record<string, { attributes: string[]; kind: SinkKind }> = {
	a: { attributes: ['href', 'xlink:href'], kind: 'link' },
	area: { attributes: ['href'], kind: 'link' },
	form: { attributes: ['action'], kind: 'form' },
	button: { attributes: ['formaction'], kind: 'form' },
	input: { attributes: ['formaction'], kind: 'form' }
};

const NAVIGATION_FUNCTIONS = [
	'goto',
	'pushState',
	'replaceState',
	'preloadData',
	'preloadCode'
] as const;
type NavigationFunction = (typeof NAVIGATION_FUNCTIONS)[number];

export default createRule('no-navigation-without-resolve', {
	meta: {
		docs: {
			description:
				'disallow internal navigation (links, `goto()`, `pushState()`, `replaceState()`) without a `resolve()`',
			category: 'SvelteKit',
			recommended: true
		},
		hasSuggestions: true,
		schema: [
			{
				type: 'object',
				properties: {
					strict: {
						type: 'boolean'
					},
					allowRelativePaths: {
						type: 'boolean'
					},
					// Deprecated: the following options will be removed in the next major version.
					ignoreGoto: {
						type: 'boolean'
					},
					ignoreLinks: {
						type: 'boolean'
					},
					ignorePushState: {
						type: 'boolean'
					},
					ignoreReplaceState: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			rootRelative:
				"'{{value}}' does not include the base path. Use `resolve()` from `$app/paths`.",
			rootRelativeLink:
				'\'{{value}}\' does not include the base path. Use `resolve()` from `$app/paths`, or add `rel="external"` if another app on this origin serves it.',
			rootRelativeFile:
				"'{{value}}' does not include the base path. Use `asset()` from `$app/paths` for files in `static`, or `resolve()` for routes.",
			pathRelative:
				"Relative URL '{{value}}' depends on the current URL and can point outside the base path. Use `resolve()` from `$app/paths`.",
			externalUrl:
				"`{{name}}()` cannot navigate to the external URL '{{value}}'. Use `window.location` or a link instead.",
			prefixBeforeBase:
				"Do not add anything before `{{name}}` ('{{value}}'). It already includes the base path.",
			preloadCodeRouteId:
				"On SvelteKit 3, `preloadCode()` takes a route ID such as '/blog/[slug]', not a URL.",
			prefixBeforeResolved:
				"Do not add anything before `{{name}}` ('{{value}}'). It already includes the base path, and during server rendering it can be a relative path such as `./foo`.",
			appendedToResolved:
				"Do not add a path after `{{name}}` ('{{value}}'). Pass the whole path to `{{name}}` instead.",
			strictUnknown:
				'Cannot verify that this URL includes the base path. Use `resolve()` from `$app/paths`.',
			strictUnknownSuffix:
				'Cannot verify that the value added after `{{name}}` starts with `?` or `#`.',
			suggestWrap: 'Wrap the URL with `{{call}}`.'
		},
		type: 'problem',
		conditions: [
			{
				svelteKitVersions: ['2', '3']
			}
		]
	},
	create(context) {
		const installedKitVersion = getInstalledSvelteKitVersion(context.filename);
		const coerced = installedKitVersion ? semver.coerce(installedKitVersion) : null;
		// `resolve()` was added in SvelteKit 2.26.
		if (coerced && semver.lt(coerced, '2.26.0')) return {};
		const isKit3 =
			getSvelteContext(context)?.svelteKitVersion === '3' ||
			(coerced !== null && coerced.major >= 3);

		const options = context.options[0] ?? {};
		const strict: boolean = options.strict ?? false;
		const allowRelativePaths: boolean = options.allowRelativePaths ?? false;
		const ignoreLinks: boolean = options.ignoreLinks ?? false;
		const ignored: Record<NavigationFunction, boolean> = {
			goto: options.ignoreGoto ?? false,
			pushState: options.ignorePushState ?? false,
			replaceState: options.ignoreReplaceState ?? false,
			preloadData: false,
			preloadCode: false
		};

		const evaluator = new UrlEvaluator(context, getTypeScriptTools(context));
		const sourceCode = context.sourceCode;

		function decide(finding: Finding, sink: SinkKind, name: string): Report | null {
			switch (finding.kind) {
				case 'ok':
					return null;
				case 'unknown':
					return strict ? { messageId: 'strictUnknown', data: {}, finding } : null;
				case 'unknownSuffix':
					return strict
						? { messageId: 'strictUnknownSuffix', data: { name: finding.name }, finding }
						: null;
				case 'external':
					return sink === 'call'
						? { messageId: 'externalUrl', data: { name, value: finding.value }, finding }
						: null;
				case 'rootRelative':
					return {
						messageId:
							finding.complete && looksLikeFile(finding.value)
								? 'rootRelativeFile'
								: sink === 'link'
									? 'rootRelativeLink'
									: 'rootRelative',
						data: { value: finding.value },
						finding
					};
				case 'pathRelative':
					return allowRelativePaths
						? null
						: { messageId: 'pathRelative', data: { value: finding.value }, finding };
				case 'prefix':
					// `goto()` runs only in the browser, where `resolve()` returns an absolute path, so
					// `location.origin + resolve(...)` works there. `page.url` is absolute everywhere.
					// An unknown prefix may be empty.
					if (finding.head === 'unknown') {
						return strict ? { messageId: 'strictUnknown', data: {}, finding } : null;
					}
					if (sink === 'call' || !finding.relativeInSsr) {
						// `page.url.origin + resolve(...)` is a full URL of this app in the browser.
						if (finding.head === 'origin') {
							return strict ? { messageId: 'strictUnknown', data: {}, finding } : null;
						}
						if (finding.head === 'external') {
							return sink === 'call'
								? { messageId: 'externalUrl', data: { name, value: finding.value }, finding }
								: null;
						}
					}
					return {
						// Only links are rendered on the server, where the value can be relative.
						messageId:
							sink !== 'call' && finding.relativeInSsr
								? 'prefixBeforeResolved'
								: 'prefixBeforeBase',
						data: { value: finding.value, name: finding.name },
						finding
					};
				case 'appended':
					return {
						messageId: 'appendedToResolved',
						data: { value: finding.value, name: finding.name },
						finding
					};
				default:
					return null;
			}
		}

		function check(value: Value, sink: SinkKind, name: string): Report | null {
			let best: Report | null = null;
			for (const alt of value) {
				const report = decide(classify(alt), sink, name);
				if (
					report !== null &&
					(best === null || PRIORITY.indexOf(report.messageId) < PRIORITY.indexOf(best.messageId))
				) {
					best = report;
				}
			}
			return best;
		}

		// --- Suggestions --------------------------------------------------------

		type Segment = { type: 'text'; value: string } | { type: 'code'; value: string };

		function segmentsOfExpression(node: TSESTree.Node): Segment[] | null {
			if (node.type === 'Literal' && typeof node.value === 'string') {
				return [{ type: 'text', value: node.value }];
			}
			if (node.type === 'TemplateLiteral') {
				const segments: Segment[] = [];
				node.quasis.forEach((quasi, index) => {
					if (quasi.value.cooked == null) return;
					segments.push({ type: 'text', value: quasi.value.cooked });
					const expression = node.expressions[index];
					if (expression) segments.push({ type: 'code', value: sourceCode.getText(expression) });
				});
				return segments.length === node.quasis.length + node.expressions.length ? segments : null;
			}
			return null;
		}

		function segmentsOfAttribute(attribute: AST.SvelteAttribute): Segment[] | null {
			const segments: Segment[] = [];
			for (const part of attribute.value) {
				if (part.type === 'SvelteLiteral') {
					// The value may contain HTML entities; do not try to convert them.
					if (sourceCode.text.slice(...part.range).includes('&')) return null;
					segments.push({ type: 'text', value: part.value });
				} else {
					const expression = part.expression;
					const nested = segmentsOfExpression(expression);
					segments.push(...(nested ?? [{ type: 'code', value: sourceCode.getText(expression) }]));
				}
			}
			return segments;
		}

		function toArgument(segments: Segment[]): string {
			if (segments.every((s) => s.type === 'text')) {
				const value = segments.map((s) => s.value).join('');
				return `'${value.replace(/\\/gu, '\\\\').replace(/'/gu, "\\'").replace(/\n/gu, '\\n').replace(/\r/gu, '\\r')}'`;
			}
			return `\`${segments
				.map((s) =>
					s.type === 'code' ? `\${${s.value}}` : s.value.replace(/[$\\`]/gu, (c) => `\\${c}`)
				)
				.join('')}\``;
		}

		/** Split the segments at the first `?` or `#`. */
		function splitQuery(segments: Segment[]): [Segment[], Segment[]] {
			const index = segments.findIndex((s) => s.type === 'text' && /[#?]/u.test(s.value));
			if (index === -1) return [segments, []];
			const text = segments[index].value;
			const at = text.search(/[#?]/u);
			const before: Segment[] = text.slice(0, at)
				? [{ type: 'text', value: text.slice(0, at) }]
				: [];
			return [
				[...segments.slice(0, index), ...before],
				[{ type: 'text', value: text.slice(at) }, ...segments.slice(index + 1)]
			];
		}

		/** Convert a root-relative pathname to the argument form of `resolve()` / `asset()`. */
		function adjustForKit(segments: Segment[], fn: 'resolve' | 'asset'): Segment[] | null {
			const [first, ...rest] = segments;
			if (
				first?.type !== 'text' ||
				!first.value.startsWith('/') ||
				PROTOCOL_RELATIVE.test(first.value)
			) {
				return null;
			}
			// `[` would turn a pathname into a route ID, and `(group)` is a route ID segment.
			// `resolve()` drops empty segments, so `//` would change the URL.
			if (
				segments.some((s) => s.type === 'text' && (s.value.includes('[') || s.value.includes('//')))
			) {
				return null;
			}
			// `resolve('/foo/')` is a type error with the default `trailingSlash`.
			const path = segments
				.map((s) => (s.type === 'text' ? s.value : 'x'))
				.join('')
				.split(/[#?]/u)[0];
			if (path.length > 1 && path.endsWith('/')) return null;
			if (path.includes('(')) return null;
			if (!isKit3) return segments;
			// SvelteKit 3: pathnames are written without the leading slash (`/` stays as the root route ID).
			if (fn === 'resolve' && first.value === '/' && rest.length === 0) return segments;
			return [{ type: 'text', value: first.value.slice(1) }, ...rest];
		}

		const scripts = (
			sourceCode.ast.body as unknown as (TSESTree.Node | AST.SvelteScriptElement)[]
		).filter((node): node is AST.SvelteScriptElement => node.type === 'SvelteScriptElement');

		/** Whether it is `<script module>` / `<script context="module">`. */
		function isModuleScript(node: AST.SvelteScriptElement) {
			return node.startTag.attributes.some(
				(attr) =>
					attr.type === 'SvelteAttribute' &&
					(attr.key.name === 'module' || attr.key.name === 'context')
			);
		}

		/** The script element that contains `node` (null in the template). */
		function scriptOf(node: TSESTree.Node): AST.SvelteScriptElement | null {
			return (
				scripts.find(
					(script) => script.range[0] <= node.range[0] && node.range[1] <= script.range[1]
				) ?? null
			);
		}

		/** The top-level statements whose imports are visible from `node`. */
		function visibleStatements(node: TSESTree.Node): TSESTree.Node[] {
			if (!sourceCode.parserServices.isSvelte)
				return sourceCode.ast.body as unknown as TSESTree.Node[];
			const own = scriptOf(node);
			// Imports of the instance script are not visible from the module script.
			const visible = own && isModuleScript(own) ? [own] : scripts;
			return visible.flatMap((script) => script.body as TSESTree.Node[]);
		}

		function findPathsImport(node: TSESTree.Node): {
			declaration: TSESTree.ImportDeclaration;
			namespace: string | null;
			named: Map<string, string>;
		}[] {
			const result = [];
			for (const statement of visibleStatements(node)) {
				if (statement.type !== 'ImportDeclaration' || statement.source.value !== '$app/paths')
					continue;
				if (statement.importKind === 'type') continue;
				let namespace: string | null = null;
				const named = new Map<string, string>();
				for (const specifier of statement.specifiers) {
					if (specifier.type === 'ImportNamespaceSpecifier') namespace = specifier.local.name;
					else if (specifier.type === 'ImportSpecifier' && specifier.importKind !== 'type') {
						const imported =
							specifier.imported.type === 'Identifier'
								? specifier.imported.name
								: specifier.imported.value;
						named.set(imported, specifier.local.name);
					}
				}
				result.push({ declaration: statement, namespace, named });
			}
			return result;
		}

		/** Whether `name` at `node` refers to the given import (or nothing). */
		function nameIsFree(node: TSESTree.Node, name: string): boolean {
			return findVariableInScope(scopeOf(context, node), name) === null;
		}

		function nameRefersToImport(
			node: TSESTree.Node,
			name: string,
			fn: string,
			namespace: boolean
		): boolean {
			const variable = findVariableInScope(scopeOf(context, node), name);
			const info = variable && getImportInfo(variable);
			return info?.source === '$app/paths' && info.imported === (namespace ? '*' : fn);
		}

		function importFix(fixer: RuleFixer, fn: string, at: TSESTree.Node) {
			const named = findPathsImport(at).find(
				(i) =>
					i.namespace === null && i.declaration.specifiers.some((s) => s.type === 'ImportSpecifier')
			);
			if (named) {
				const specifiers = named.declaration.specifiers;
				return fixer.insertTextAfter(specifiers[specifiers.length - 1] as never, `, ${fn}`);
			}
			const eol = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';
			const statement = `import { ${fn} } from '$app/paths';`;
			const own = scriptOf(at);
			const script = sourceCode.parserServices.isSvelte
				? (own ?? scripts.find((node) => !isModuleScript(node)) ?? scripts[0] ?? null)
				: null;
			const target = (
				script !== null
					? (script.body as TSESTree.Node[])
					: (sourceCode.ast.body as unknown as TSESTree.Node[])
			)
				.filter((node) => node.type === 'ImportDeclaration')
				.pop();
			if (target) {
				const line = sourceCode.lines[target.loc.start.line - 1];
				const indent = /^\s*/u.exec(line)![0];
				return fixer.insertTextAfterRange(target.range, `${eol}${indent}${statement}`);
			}
			if (script !== null) {
				return fixer.insertTextAfterRange(script.startTag.range, `${eol}\t${statement}`);
			}
			if (sourceCode.parserServices.isSvelte) {
				return fixer.insertTextBeforeRange(
					[0, 0],
					`<script>${eol}\t${statement}${eol}</script>${eol}${eol}`
				);
			}
			return fixer.insertTextBeforeRange([0, 0], `${statement}${eol}`);
		}

		function buildSuggestions(
			report: Report,
			value: Value,
			at: TSESTree.Node,
			range: [number, number],
			segments: Segment[] | null,
			wrap: (call: string) => string
		): SuggestionReportDescriptor[] {
			if (report.finding.kind !== 'rootRelative' || segments === null || value.length !== 1)
				return [];
			const fns: ('resolve' | 'asset')[] =
				// `asset()` does not take a query or a hash.
				report.messageId === 'rootRelativeFile' && !/[#?]/u.test(report.finding.value)
					? ['asset', 'resolve']
					: ['resolve'];
			const suggestions: SuggestionReportDescriptor[] = [];
			const imports = findPathsImport(at);
			const [pathname, query] = splitQuery(segments);
			for (const fn of fns) {
				const adjusted = adjustForKit(pathname, fn);
				if (adjusted === null) continue;
				let callee: string | null = null;
				let needsImport = false;
				for (const i of imports) {
					const local = i.named.get(fn);
					if (local && nameRefersToImport(at, local, fn, false)) callee = local;
					else if (!callee && i.namespace && nameRefersToImport(at, i.namespace, fn, true))
						callee = `${i.namespace}.${fn}`;
				}
				if (callee === null) {
					if (!nameIsFree(at, fn)) continue;
					callee = fn;
					needsImport = true;
				}
				// `resolve()` takes a pathname: the query and the hash go after it.
				const call =
					query.length === 0
						? `${callee}(${toArgument(adjusted)})`
						: query.every((s) => s.type === 'text')
							? `${callee}(${toArgument(adjusted)}) + ${toArgument(query)}`
							: toArgument([
									{ type: 'code', value: `${callee}(${toArgument(adjusted)})` },
									...query
								]);
				suggestions.push({
					messageId: 'suggestWrap',
					data: { call: `${callee}()` },
					fix(fixer) {
						const fixes = [fixer.replaceTextRange(range, wrap(call))];
						if (needsImport) fixes.push(importFix(fixer, fn, at));
						return fixes;
					}
				});
			}
			return suggestions;
		}

		// --- Sinks ----------------------------------------------------------------

		function checkCall(name: NavigationFunction, call: TSESTree.CallExpression) {
			if (name === 'preloadCode' && isKit3) {
				checkKit3PreloadCode(call);
				return;
			}
			const args = name === 'preloadCode' ? call.arguments : call.arguments.slice(0, 1);
			for (const arg of args) {
				if (arg.type === 'SpreadElement') continue;
				const value = evaluator.evaluateUrl(arg);
				const report = check(value, 'call', name);
				if (report === null) continue;
				context.report({
					node: arg,
					messageId: report.messageId,
					data: report.data,
					suggest: buildSuggestions(
						report,
						value,
						arg,
						arg.range,
						segmentsOfExpression(arg),
						(c) => c
					)
				});
			}
		}

		/** SvelteKit 3 `preloadCode()` takes a route ID, so a resolved URL is a mistake. */
		function checkKit3PreloadCode(call: TSESTree.CallExpression) {
			const [arg] = call.arguments;
			if (arg === undefined || arg.type === 'SpreadElement') return;
			const value = evaluator.evaluateUrl(arg);
			const isUrl = value.every((alt) => {
				const first = alt?.find((part) => part.type !== 'text' || part.value.trim() !== '');
				return first !== undefined && (first.type === 'resolved' || first.type === 'based');
			});
			if (value.length > 0 && isUrl) context.report({ node: arg, messageId: 'preloadCodeRouteId' });
		}

		function attributeValue(attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute): Value {
			if (attribute.type === 'SvelteShorthandAttribute')
				return evaluator.evaluateUrl(attribute.value);
			// `<a href>` is the same as `href=""`.
			if (attribute.value.length === 0) return text('');
			// `href={x}` and `href="{x}"` pass `x` as is (`null` removes the attribute).
			const [first] = attribute.value;
			if (attribute.value.length === 1 && first.type === 'SvelteMustacheTag') {
				return evaluator.evaluateUrl(first.expression);
			}
			return concat(
				attribute.value.map((part) =>
					part.type === 'SvelteLiteral'
						? evaluator.evaluateUrl(part)
						: evaluator.evaluateUrl(part.expression)
				)
			);
		}

		function hasRelExternal(startTag: AST.SvelteStartTag): boolean {
			const rel = startTag.attributes.find(
				(attr): attr is AST.SvelteAttribute | AST.SvelteShorthandAttribute =>
					(attr.type === 'SvelteAttribute' || attr.type === 'SvelteShorthandAttribute') &&
					attr.key.name.toLowerCase() === 'rel'
			);
			if (rel === undefined) return false;
			const value = attributeValue(rel);
			// In strict mode, every possible value must contain the complete `external` token.
			// Otherwise, a value that may contain it (e.g. `rel={rel}`) is enough.
			return value[strict ? 'every' : 'some']((alt) => {
				if (alt === null) return false;
				if (!strict && alt.some((part) => part.type !== 'text')) return true;
				return alt.some(
					(part, index) =>
						part.type === 'text' &&
						part.value.split(/\s+/u).some((token, tokenIndex, tokens) => {
							// SvelteKit compares the token case-sensitively.
							if (token !== 'external') return false;
							// The token must not touch an unknown part.
							const touchesStart = tokenIndex === 0 && index > 0 && !/^\s/u.test(part.value);
							const touchesEnd =
								tokenIndex === tokens.length - 1 &&
								index < alt.length - 1 &&
								!/\s$/u.test(part.value);
							return !touchesStart && !touchesEnd;
						})
				);
			});
		}

		function checkAttribute(
			element: AST.SvelteElement,
			attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute,
			sink: SinkKind
		) {
			const value = attributeValue(attribute);
			const segments = attribute.type === 'SvelteAttribute' ? segmentsOfAttribute(attribute) : null;
			const report = check(value, sink, '');
			if (report === null) return;
			const key = sourceCode.getText(attribute.key as never);
			context.report({
				node: attribute as never,
				messageId: report.messageId,
				data: report.data,
				suggest: buildSuggestions(
					report,
					value,
					element as never,
					attribute.range,
					segments,
					(c) => `${key}={${c}}`
				)
			});
		}

		return {
			Program() {
				const tracker = new ReferenceTracker(sourceCode.scopeManager.globalScope!);
				const traceMap = Object.fromEntries(
					NAVIGATION_FUNCTIONS.filter((name) => !ignored[name]).map((name) => [
						name,
						{ [ReferenceTracker.CALL]: name }
					])
				);
				for (const { node: call, info } of tracker.iterateEsmReferences({
					'$app/navigation': { [ReferenceTracker.ESM]: true, ...traceMap }
				})) {
					checkCall(info as NavigationFunction, call as TSESTree.CallExpression);
				}
			},
			SvelteElement(element: AST.SvelteElement) {
				if (element.kind !== 'html' || element.name.type !== 'SvelteName') return;
				const config = LINK_ATTRIBUTES[element.name.name.toLowerCase()];
				if (config === undefined) return;
				if (config.kind === 'link' && (ignoreLinks || hasRelExternal(element.startTag))) return;
				// A spread may set `rel="external"` or replace the URL, so nothing can be proven.
				if (!strict && element.startTag.attributes.some((a) => a.type === 'SvelteSpreadAttribute'))
					return;
				for (const attribute of element.startTag.attributes) {
					if (
						(attribute.type === 'SvelteAttribute' ||
							attribute.type === 'SvelteShorthandAttribute') &&
						config.attributes.includes(attribute.key.name.toLowerCase())
					) {
						checkAttribute(element, attribute, config.kind);
					}
				}
			}
		};
	}
});
