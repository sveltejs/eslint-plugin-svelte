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
	/** Anything else. */
	| { readonly type: 'unknown' };
type Alt = readonly Part[] | null;
type Value = readonly Alt[];

const UNKNOWN_PART: Part = { type: 'unknown' };
const UNKNOWN: Value = [[UNKNOWN_PART]];
const NULLISH: Value = [null];
const RESOLVED: Value = [[{ type: 'resolved', label: 'resolve()' }]];

function resolved(label: string): Value {
	return [[{ type: 'resolved', label }]];
}

function based(label: string): Value {
	return [[{ type: 'based', label }]];
}

const MAX_ALTS = 64;
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
	let result: Value = [[]];
	for (const value of values) {
		const next: Alt[] = [];
		// In a string concatenation, a nullish value becomes `"null"` / `"undefined"`.
		const right = value.map((alt) => alt ?? [UNKNOWN_PART]);
		if (result.length * right.length > MAX_ALTS) {
			// Too many combinations: keep the heads, which decide the classification.
			for (const left of result) next.push(normalize([...(left ?? []), UNKNOWN_PART]));
		} else {
			for (const left of result) {
				for (const r of right) next.push(normalize([...(left ?? []), ...r]));
			}
		}
		result = union(next);
	}
	return result;
}

/** Whether the value may be `null` / `undefined`. */
function mayBeNullish(value: Value): boolean {
	return value.some((alt) => alt === null || (alt.length === 1 && alt[0].type === 'unknown'));
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
			readonly head: 'text' | 'external' | 'unknown';
	  }
	| { readonly kind: 'appended'; readonly value: string; readonly name: string };

const OK: Finding = { kind: 'ok' };
const SCHEME = /^[a-z][\d+\-.a-z]*:/iu;
const SCHEME_PREFIX = /^[a-z][\d+\-.a-z]*$/iu;
const PROTOCOL_RELATIVE = /^[/\\]{2}/u;
// Browsers ignore leading C0 control characters and spaces in URLs.
// eslint-disable-next-line no-control-regex -- U+0000 to U+0020 is intended
const LEADING_IGNORED = /^[\u0000-\u0020]+/u;

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
	const parts = [...alt];
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
	if (anchor && anchorIndex > 0) {
		const head = parts[0];
		return {
			kind: 'prefix',
			value,
			name: anchor.label,
			// `page.url` is always absolute. `resolve()`, `asset()`, `base` and `assets` can be
			// relative during server rendering.
			relativeInSsr:
				anchor.type === 'resolved' || anchor.label === 'base' || anchor.label === 'assets',
			head: head.type !== 'text' ? 'unknown' : isExternalText(head.value) ? 'external' : 'text'
		};
	}
	if (anchor) {
		if (anchor.type === 'based') return OK;
		const next = parts[1];
		if (next === undefined) return OK;
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
	if (def?.type !== 'ImportBinding') return null;
	const declaration = def.parent as TSESTree.ImportDeclaration;
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
	private readonly activeNodes = new Set<unknown>();

	private readonly activeVariables = new Set<Variable>();

	private depth = 0;

	private resolvedPathnameType: TS.Type | null | undefined = undefined;

	private readonly context: RuleContext;

	private readonly tsTools: TSTools | null;

	public constructor(context: RuleContext, tsTools: TSTools | null) {
		this.context = context;
		this.tsTools = tsTools;
	}

	public evaluate(node: TSESTree.Node | AST.SvelteLiteral): Value {
		if (this.depth >= MAX_DEPTH || this.activeNodes.has(node)) return UNKNOWN;
		this.activeNodes.add(node);
		this.depth++;
		try {
			return this.evaluateNode(node);
		} finally {
			this.depth--;
			this.activeNodes.delete(node);
		}
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
				// `&&`
				return mayBeFalsy(left)
					? union(
							left.filter((alt) => alt !== null && alt.length === 0),
							NULLISH,
							this.evaluate(node.right)
						)
					: this.evaluate(node.right);
			}
			case 'ConditionalExpression':
				return union(this.evaluate(node.consequent), this.evaluate(node.alternate));
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
		if (this.activeVariables.has(variable)) return UNKNOWN;
		this.activeVariables.add(variable);
		try {
			const sources = this.variableSources(variable);
			if (sources === null) return this.refine(node);
			return union(...sources.map((source) => this.evaluateSource(source, node)));
		} finally {
			this.activeVariables.delete(variable);
		}
	}

	private evaluateSource(source: SourceRef, fallback: TSESTree.Node): Value {
		if (source.type === 'node') return this.evaluate(source.node);
		return source.type === 'absent' ? NULLISH : this.refine(fallback);
	}

	/**
	 * Every value that is assigned to the variable, or null if the variable is not a
	 * local variable that can be followed (an import, a parameter, a global...).
	 */
	private variableSources(variable: Variable): SourceRef[] | null {
		const def = variable.defs[0];
		if (def === undefined || def.type === 'ImportBinding') return null;
		const name = def.name as TSESTree.Identifier;
		const each = eachBlockOf(name);
		if (each !== null) return this.eachSources(each, name);
		if (def.type !== 'Variable' || def.node.type !== 'VariableDeclarator') return null;

		const declarator = def.node;
		const declaration = declarator.parent;
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
		if (this.depth >= MAX_DEPTH || this.activeNodes.has(node)) return [UNKNOWN_SOURCE];
		this.activeNodes.add(node);
		this.depth++;
		try {
			if (node.type === 'Identifier') {
				const variable = findVariable(this.context, node);
				if (
					variable === null ||
					variable.name !== node.name ||
					this.activeVariables.has(variable)
				) {
					return [{ type: 'node', node }];
				}
				this.activeVariables.add(variable);
				try {
					const sources = this.variableSources(variable);
					if (sources === null) return [{ type: 'node', node }];
					return sources
						.flatMap((s) => (s.type === 'node' ? this.candidates(s.node) : [s]))
						.slice(0, MAX_ALTS);
				} finally {
					this.activeVariables.delete(variable);
				}
			}
			if (node.type === 'MemberExpression') {
				const key = getPropertyName(node, scopeOf(this.context, node));
				if (key === null) return [{ type: 'node', node }];
				const found = this.lookup(node.object, key);
				if (found.every((s) => s.type === 'unknown')) return [{ type: 'node', node }];
				return found
					.flatMap((s) => (s.type === 'node' ? this.candidates(s.node) : [s]))
					.slice(0, MAX_ALTS);
			}
			return [{ type: 'node', node }];
		} finally {
			this.depth--;
			this.activeNodes.delete(node);
		}
	}

	/** Find the values of `object[key]` where `object` is an object or array literal. */
	private lookup(object: TSESTree.Expression, key: string): SourceRef[] {
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

	private lookupInObject(object: TSESTree.ObjectExpression, key: string): SourceRef[] {
		// Last write wins.
		let result: SourceRef[] = [ABSENT_SOURCE];
		for (const property of object.properties) {
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
			const name = getPropertyName(property, scopeOf(this.context, property));
			if (name === null) {
				result = [UNKNOWN_SOURCE];
			} else if (name === key) {
				result =
					property.kind === 'init' && property.value.type !== 'AssignmentPattern'
						? [{ type: 'node', node: property.value as TSESTree.Expression }]
						: [UNKNOWN_SOURCE];
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
				items.push(...spread.items);
				if (!spread.complete) return { items, complete: false };
			} else {
				items.push(element);
			}
		}
		return { items, complete: true };
	}

	private evaluateMember(node: TSESTree.MemberExpression): Value {
		const key = getPropertyName(node, scopeOf(this.context, node));
		if (key === null) return this.refine(node);

		// `page.url`, `page.url.pathname`, `page.url.href`
		if (key === 'url' && this.isPage(node.object)) return based('page.url');
		if ((key === 'pathname' || key === 'href') && this.isPageUrl(node.object)) {
			return based(`page.url.${key}`);
		}
		// `new URL(...).href`
		if (key === 'href') {
			const url = this.evaluateUrlObject(node.object);
			if (url !== null) return url;
		}
		return union(
			...this.lookup(node.object, key).map((source) => this.evaluateSource(source, node))
		);
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
		return this.refine(node);
	}

	private evaluateNew(node: TSESTree.NewExpression): Value {
		if (!this.isUrlConstructor(node)) return this.refine(node);
		const [input, base] = node.arguments;
		if (input === undefined || input.type === 'SpreadElement') return this.refine(node);
		const value = this.evaluate(input);
		if (base === undefined) return value;
		if (base.type === 'SpreadElement') return UNKNOWN;
		// Against an external base, a path is no longer a path of this app.
		const externalBase = this.evaluate(base).some((alt) => classify(alt).kind === 'external');
		if (!externalBase) return value;
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
		if (this.tsTools) {
			const type = this.typeOf(typed);
			if (type !== null)
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
		return type === null ? UNKNOWN : this.fromType(type);
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
		return union(...nullish, UNKNOWN);
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
			// In SvelteKit 3, `preloadCode()` takes a route ID.
			preloadCode: isKit3
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
					if (sink === 'call' || !finding.relativeInSsr) {
						if (finding.head === 'unknown') {
							return strict ? { messageId: 'strictUnknown', data: {}, finding } : null;
						}
						if (finding.head === 'external') {
							return sink === 'call'
								? { messageId: 'externalUrl', data: { name, value: finding.value }, finding }
								: null;
						}
					}
					return {
						messageId: 'prefixBeforeResolved',
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

		/** Convert a root-relative URL to the argument form of `resolve()` / `asset()`. */
		function adjustForKit(segments: Segment[], fn: 'resolve' | 'asset'): Segment[] | null {
			const [first, ...rest] = segments;
			if (
				first?.type !== 'text' ||
				!first.value.startsWith('/') ||
				PROTOCOL_RELATIVE.test(first.value)
			) {
				return null;
			}
			// `[` would turn a pathname into a route ID.
			if (segments.some((s) => s.type === 'text' && s.value.includes('['))) return null;
			if (!isKit3) return segments;
			// SvelteKit 3: pathnames are written without the leading slash (`/` stays as the root route ID).
			const isRoot = first.value === '/' ? rest.length === 0 : /^\/[#?]/u.test(first.value);
			if (fn === 'resolve' && isRoot) return segments;
			return [{ type: 'text', value: first.value.slice(1) }, ...rest];
		}

		function findPathsImport(): {
			declaration: TSESTree.ImportDeclaration;
			namespace: string | null;
			named: Map<string, string>;
		}[] {
			const result = [];
			const body: TSESTree.Node[] = [];
			for (const node of sourceCode.ast.body as unknown as (
				| TSESTree.Node
				| AST.SvelteScriptElement
			)[]) {
				if (node.type === 'SvelteScriptElement') body.push(...(node.body as TSESTree.Node[]));
				else body.push(node);
			}
			for (const node of body) {
				if (node.type !== 'ImportDeclaration' || node.source.value !== '$app/paths') continue;
				if (node.importKind === 'type') continue;
				let namespace: string | null = null;
				const named = new Map<string, string>();
				for (const specifier of node.specifiers) {
					if (specifier.type === 'ImportNamespaceSpecifier') namespace = specifier.local.name;
					else if (specifier.type === 'ImportSpecifier' && specifier.importKind !== 'type') {
						const imported =
							specifier.imported.type === 'Identifier'
								? specifier.imported.name
								: specifier.imported.value;
						named.set(imported, specifier.local.name);
					}
				}
				result.push({ declaration: node, namespace, named });
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

		function importFix(fixer: RuleFixer, fn: string) {
			const imports = findPathsImport();
			const named = imports.find(
				(i) =>
					i.namespace === null && i.declaration.specifiers.some((s) => s.type === 'ImportSpecifier')
			);
			if (named) {
				const specifiers = named.declaration.specifiers;
				return fixer.insertTextAfter(specifiers[specifiers.length - 1] as never, `, ${fn}`);
			}
			const statement = `import { ${fn} } from '$app/paths';`;
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

			const script =
				scripts.find((node) => !isModuleScript(node)) ?? scripts.find(isModuleScript) ?? null;
			const programImports = (sourceCode.ast.body as unknown as TSESTree.Node[]).filter(
				(node) => node.type === 'ImportDeclaration'
			);
			const target =
				script !== null
					? (script.body as TSESTree.Node[]).filter((n) => n.type === 'ImportDeclaration').pop()
					: programImports.pop();
			if (target) {
				const line = sourceCode.lines[target.loc.start.line - 1];
				const indent = /^\s*/u.exec(line)![0];
				return fixer.insertTextAfterRange(target.range, `\n${indent}${statement}`);
			}
			if (script !== null) {
				return fixer.insertTextAfterRange(script.startTag.range, `\n\t${statement}`);
			}
			if (sourceCode.parserServices.isSvelte) {
				return fixer.insertTextBeforeRange([0, 0], `<script>\n\t${statement}\n</script>\n\n`);
			}
			return fixer.insertTextBeforeRange([0, 0], `${statement}\n`);
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
			const imports = findPathsImport();
			for (const fn of fns) {
				const adjusted = adjustForKit(segments, fn);
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
				const call = `${callee}(${toArgument(adjusted)})`;
				suggestions.push({
					messageId: 'suggestWrap',
					data: { call: `${callee}()` },
					fix(fixer) {
						const fixes = [fixer.replaceTextRange(range, wrap(call))];
						if (needsImport) fixes.push(importFix(fixer, fn));
						return fixes;
					}
				});
			}
			return suggestions;
		}

		// --- Sinks ----------------------------------------------------------------

		function checkCall(name: NavigationFunction, call: TSESTree.CallExpression) {
			const args = name === 'preloadCode' ? call.arguments : call.arguments.slice(0, 1);
			for (const arg of args) {
				if (arg.type === 'SpreadElement') continue;
				const value = evaluator.evaluate(arg);
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

		function attributeValue(attribute: AST.SvelteAttribute | AST.SvelteShorthandAttribute): Value {
			if (attribute.type === 'SvelteShorthandAttribute') return evaluator.evaluate(attribute.value);
			// `<a href>` is the same as `href=""`.
			if (attribute.value.length === 0) return text('');
			// `href={x}` and `href="{x}"` pass `x` as is (`null` removes the attribute).
			const [first] = attribute.value;
			if (attribute.value.length === 1 && first.type === 'SvelteMustacheTag') {
				return evaluator.evaluate(first.expression);
			}
			return concat(
				attribute.value.map((part) =>
					part.type === 'SvelteLiteral'
						? evaluator.evaluate(part)
						: evaluator.evaluate(part.expression)
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
			// Every possible value must contain the complete `external` token.
			return value.every((alt) => {
				if (alt === null) return false;
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
