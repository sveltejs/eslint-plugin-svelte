import type { AST } from 'svelte-eslint-parser';
import type { RuleContext } from '../../types.js';
import Parser from './template-safe-parser.js';
import type { Root, ChildNode, AnyNode } from 'postcss';
import { Input } from 'postcss';
import type { TSESTree } from '@typescript-eslint/types';
import { getSourceCode } from '../compat.js';

/** Parse for CSS */
function safeParseCss(css: string): Root | null {
	try {
		const input = new Input(css);
		const parser = new Parser(input);
		parser.parse();
		return parser.root;
	} catch {
		return null;
	}
}

const cache = new WeakMap<AST.SvelteAttribute>();

/**
 * Parse style attribute value
 */
export function parseStyleAttributeValue(
	node: AST.SvelteAttribute,
	context: RuleContext
): SvelteStyleRoot<AST.SvelteMustacheTagText> | null {
	if (cache.has(node)) {
		return cache.get(node) || null;
	}
	cache.set(node, null);
	if (!node.value?.length) {
		return null;
	}
	const startOffset = node.value[0].range[0];
	const sourceCode = getSourceCode(context);
	const cssCode = node.value.map((value) => sourceCode.getText(value)).join('');
	const root = safeParseCss(cssCode);
	if (!root) {
		return root;
	}
	const ctx: Ctx = {
		startOffset,
		value: node.value,
		context
	};

	const mustacheTags = node.value.filter(
		(v): v is AST.SvelteMustacheTagText => v.type === 'SvelteMustacheTag'
	);

	const converted = convertRoot(root, mustacheTags, (e) => e.range, ctx);
	cache.set(node, converted);
	return converted;
}

export type SvelteStyleInterpolation = AST.SvelteMustacheTagText | TSESTree.Expression;

export interface SvelteStyleNode<E extends SvelteStyleInterpolation> {
	nodes?: SvelteStyleChildNode<E>[];
	range: AST.Range;
	loc: AST.SourceLocation;
}
export interface SvelteStyleRoot<E extends SvelteStyleInterpolation = SvelteStyleInterpolation> {
	type: 'root';
	nodes: (SvelteStyleChildNode<E> | SvelteStyleInline<E>)[];
}
export interface SvelteStyleInline<E extends SvelteStyleInterpolation = SvelteStyleInterpolation>
	extends SvelteStyleNode<E> {
	type: 'inline';
	node: E;
	getInlineStyle(node: TSESTree.Expression): SvelteStyleRoot<TSESTree.Expression> | null;
	getAllInlineStyles(): Map<TSESTree.Expression, SvelteStyleRoot<TSESTree.Expression>>;
}
export interface SvelteStyleDeclaration<
	E extends SvelteStyleInterpolation = SvelteStyleInterpolation
> extends SvelteStyleNode<E> {
	type: 'decl';
	prop: {
		name: string;
		range: AST.Range;
		loc: AST.SourceLocation;
		interpolations: E[];
	};
	value: {
		value: string;
		range: AST.Range;
		loc: AST.SourceLocation;
		interpolations: E[];
	};
	important: boolean;
	addInterpolation: (tagOrExpr: E) => void;
	unknownInterpolations: E[];
}
export interface SvelteStyleComment extends SvelteStyleNode<never> {
	type: 'comment';
	addInterpolation: (tagOrExpr: SvelteStyleInterpolation) => void;
}

export type SvelteStyleChildNode<E extends SvelteStyleInterpolation = SvelteStyleInterpolation> =
	| SvelteStyleDeclaration<E>
	| SvelteStyleComment;

class IgnoreError extends Error {}

type Ctx = {
	startOffset: number;
	value: AST.SvelteAttribute['value'];
	context: RuleContext;
};

/** Checks wether the given node is string literal or not  */
function isStringLiteral(node: TSESTree.Expression): node is TSESTree.Literal & { value: string } {
	return node.type === 'Literal' && typeof node.value === 'string';
}

/** convert root node */
function convertRoot<E extends SvelteStyleInterpolation>(
	root: Root,
	interpolations: E[],
	getRange: (e: E) => AST.Range,
	ctx: Ctx
): SvelteStyleRoot<E> | null {
	const nodes: (SvelteStyleChildNode<E> | SvelteStyleInline<E>)[] = [];
	for (const child of root.nodes) {
		const converted = convertChild<E>(child, ctx);
		if (!converted) {
			return null;
		}

		while (interpolations[0]) {
			const tagOrExpr = interpolations[0];
			if (tagOrExpr.range[1] <= converted.range[0]) {
				nodes.push(buildSvelteStyleInline(tagOrExpr));
				interpolations.shift();
				continue;
			}
			if (tagOrExpr.range[0] < converted.range[1]) {
				try {
					converted.addInterpolation(tagOrExpr);
				} catch (e) {
					if (e instanceof IgnoreError) return null;
					throw e;
				}
				interpolations.shift();
				continue;
			}
			break;
		}

		nodes.push(converted);
	}

	nodes.push(...interpolations.map(buildSvelteStyleInline));

	return {
		type: 'root',
		nodes
	};

	/** Build SvelteStyleInline */
	function buildSvelteStyleInline(tagOrExpr: E): SvelteStyleInline<E> {
		const inlineStyles = new Map<
			TSESTree.Expression,
			SvelteStyleRoot<TSESTree.Expression> | null
		>();
		let range: AST.Range | null = null;

		/** Get range */
		function getRangeForInline() {
			if (range) {
				return range;
			}
			return range ?? (range = getRange(tagOrExpr));
		}

		return {
			type: 'inline',
			node: tagOrExpr,
			get range() {
				return getRangeForInline();
			},
			get loc() {
				return toLoc(getRangeForInline(), ctx);
			},
			getInlineStyle(node) {
				return getInlineStyle(node);
			},
			getAllInlineStyles() {
				const allInlineStyles = new Map<
					TSESTree.Expression,
					SvelteStyleRoot<TSESTree.Expression>
				>();
				for (const node of extractExpressions(tagOrExpr)) {
					const style = getInlineStyle(node);
					if (style) {
						allInlineStyles.set(node, style);
					}
				}
				return allInlineStyles;
			}
		};

		/** Get inline style node */
		function getInlineStyle(
			node: SvelteStyleInterpolation
		): SvelteStyleRoot<TSESTree.Expression> | null {
			if (node.type === 'SvelteMustacheTag') {
				return getInlineStyle(node.expression);
			}
			if (inlineStyles.has(node)) {
				return inlineStyles.get(node) || null;
			}
			const sourceCode = getSourceCode(ctx.context);
			inlineStyles.set(node, null);

			let converted: SvelteStyleRoot<TSESTree.Expression> | null;
			if (isStringLiteral(node)) {
				const root = safeParseCss(sourceCode.getText(node).slice(1, -1));
				if (!root) {
					return null;
				}
				converted = convertRoot<TSESTree.Expression>(root, [], () => [0, 0], {
					...ctx,
					startOffset: node.range[0] + 1
				});
			} else if (node.type === 'TemplateLiteral') {
				const root = safeParseCss(sourceCode.getText(node).slice(1, -1));
				if (!root) {
					return null;
				}
				converted = convertRoot(
					root,
					[...node.expressions],
					(e) => {
						const index = node.expressions.indexOf(e);
						return [node.quasis[index].range[1] - 2, node.quasis[index + 1].range[0] + 1];
					},
					{
						...ctx,
						startOffset: node.range[0] + 1
					}
				);
			} else {
				return null;
			}
			inlineStyles.set(node, converted);
			return converted;
		}

		/** Extract all expressions */
		function* extractExpressions(
			node: SvelteStyleInterpolation
		): Iterable<TSESTree.StringLiteral | TSESTree.TemplateLiteral> {
			if (node.type === 'SvelteMustacheTag') {
				yield* extractExpressions(node.expression);
			} else if (isStringLiteral(node)) {
				yield node;
			} else if (node.type === 'TemplateLiteral') {
				yield node;
			} else if (node.type === 'ConditionalExpression') {
				yield* extractExpressions(node.consequent);
				yield* extractExpressions(node.alternate);
			} else if (node.type === 'LogicalExpression') {
				yield* extractExpressions(node.left);
				yield* extractExpressions(node.right);
			}
		}
	}
}

/** convert child node */
function convertChild<E extends SvelteStyleInterpolation>(
	node: ChildNode,
	ctx: Ctx
): SvelteStyleChildNode<E> | null {
	const range = convertRange(node, ctx);
	if (node.type === 'decl') {
		const propRange: AST.Range = [range[0], range[0] + node.prop.length];
		const declValueStartIndex = propRange[1] + (node.raws.between || '').length;
		const valueRange: AST.Range = [
			declValueStartIndex,
			declValueStartIndex + (node.raws.value?.value || node.value).length
		];
		const prop: SvelteStyleDeclaration<E>['prop'] = {
			name: node.prop,
			range: propRange,
			get loc() {
				return toLoc(propRange, ctx);
			},
			interpolations: []
		};
		const value: SvelteStyleDeclaration<E>['value'] = {
			value: node.value,
			range: valueRange,
			get loc() {
				return toLoc(valueRange, ctx);
			},
			interpolations: []
		};
		const unknownInterpolations: E[] = [];
		return {
			type: 'decl',
			prop,
			value,
			important: node.important,
			range,
			get loc() {
				return toLoc(range, ctx);
			},
			addInterpolation(tagOrExpr) {
				const index = tagOrExpr.range[0];
				if (prop.range[0] <= index && index < prop.range[1]) {
					prop.interpolations.push(tagOrExpr);
					return;
				}
				if (value.range[0] <= index && index < value.range[1]) {
					value.interpolations.push(tagOrExpr);
					return;
				}
				unknownInterpolations.push(tagOrExpr);
			},
			unknownInterpolations
		};
	}
	if (node.type === 'comment') {
		return {
			type: 'comment',
			range,
			get loc() {
				return toLoc(range, ctx);
			},
			addInterpolation: () => {
				throw new IgnoreError();
			}
		};
	}
	if (node.type === 'atrule') {
		// unexpected node
		return null;
	}
	if (node.type === 'rule') {
		// unexpected node
		return null;
	}
	// unknown node
	return null;
}

/** convert range */
function convertRange(node: AnyNode, ctx: Ctx): AST.Range {
	return [ctx.startOffset + node.source!.start!.offset, ctx.startOffset + node.source!.end!.offset];
}

/** convert range */
function toLoc(range: AST.Range, ctx: Ctx): AST.SourceLocation {
	return {
		start: getSourceCode(ctx.context).getLocFromIndex(range[0]),
		end: getSourceCode(ctx.context).getLocFromIndex(range[1])
	};
}
