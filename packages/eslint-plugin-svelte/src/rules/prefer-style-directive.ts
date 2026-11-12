import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type {
	SvelteStyleDeclaration,
	SvelteStyleInline,
	SvelteStyleRoot
} from '../utils/css-utils/index.js';
import { parseStyleAttributeValue, SHORTHAND_PROPERTIES } from '../utils/css-utils/index.js';
import type { RuleFixer } from '../types.js';
import { isHTMLElementLike } from '../utils/ast-utils.js';

/** Checks wether the given node is string literal or not  */
function isStringLiteral(node: TSESTree.Expression): node is TSESTree.StringLiteral {
	return node.type === 'Literal' && typeof node.value === 'string';
}

/** Normalize a CSS property name for comparison */
function normalizePropName(name: string): string {
	// Custom properties are case-sensitive.
	return name.startsWith('--') ? name : name.toLowerCase();
}

/** Collect the property names that the given style attribute sets */
function getPropNames(root: SvelteStyleRoot<AST.SvelteMustacheTagText>): string[] {
	const names: string[] = [];
	for (const node of root.nodes) {
		if (node.type === 'decl') {
			names.push(normalizePropName(node.prop.name));
		} else if (node.type === 'inline') {
			for (const inlineRoot of node.getAllInlineStyles().values()) {
				for (const inlineNode of inlineRoot.nodes) {
					if (inlineNode.type === 'decl') {
						names.push(normalizePropName(inlineNode.prop.name));
					}
				}
			}
		}
	}
	return names;
}

/**
 * Shorthands whose longhands do not start with the shorthand name.
 * `SHORTHAND_PROPERTIES` is shared with other rules, so they are listed here.
 */
const EXTRA_SHORTHAND_PROPERTIES = new Map<string, string[]>([
	['gap', ['row-gap', 'column-gap']],
	['grid-gap', ['row-gap', 'column-gap']],
	['inset', ['top', 'right', 'bottom', 'left']],
	['place-content', ['align-content', 'justify-content']],
	['place-items', ['align-items', 'justify-items']],
	['place-self', ['align-self', 'justify-self']],
	['white-space', ['white-space-collapse', 'text-wrap-mode']]
]);

/** Get the longhands that the given property sets */
function getLonghands(name: string): string[] {
	return [
		name,
		...(SHORTHAND_PROPERTIES.get(name) ?? []),
		...(EXTRA_SHORTHAND_PROPERTIES.get(name) ?? [])
	];
}

const PHYSICAL_KEYWORDS = new Set(['top', 'right', 'bottom', 'left', 'x', 'y']);
const LOGICAL_KEYWORDS = new Set(['block', 'inline', 'start', 'end']);

/**
 * Get the property name without the side and axis keywords,
 * e.g. `margin` for `margin-left` and `margin-inline-start`,
 * and `size` for `width` and `inline-size`.
 */
function parseFlowRelative(name: string) {
	if (name === 'top' || name === 'right' || name === 'bottom' || name === 'left') {
		return { base: 'inset', physical: true, logical: false };
	}
	let physical = false;
	let logical = false;
	const words: string[] = [];
	for (const word of name.split('-')) {
		if (PHYSICAL_KEYWORDS.has(word)) {
			physical = true;
		} else if (LOGICAL_KEYWORDS.has(word)) {
			logical = true;
		} else if (word === 'width' || word === 'height') {
			physical = true;
			words.push('size');
		} else {
			words.push(word);
		}
	}
	return { base: words.join('-'), physical, logical };
}

/**
 * Checks whether the given physical and logical properties can set the same value,
 * e.g. `margin-left` and `margin-inline-start`.
 */
function isSameFlowRelativeProperty(a: string, b: string): boolean {
	const parsedA = parseFlowRelative(a);
	const parsedB = parseFlowRelative(b);
	return (
		parsedA.base === parsedB.base &&
		((parsedA.physical && parsedB.logical) || (parsedA.logical && parsedB.physical))
	);
}

/**
 * Checks whether the given two different properties can set the same value,
 * e.g. a shorthand and its longhand like `margin` and `margin-top`.
 */
function isOverlappingProperty(a: string, b: string): boolean {
	if (a.startsWith('--') || b.startsWith('--')) {
		// Custom properties
		return false;
	}
	const nameA = a.toLowerCase();
	const nameB = b.toLowerCase();
	if (nameA === nameB) {
		return false;
	}
	if (nameA === 'all' || nameB === 'all') {
		// `all` resets all properties except `direction` and `unicode-bidi`.
		const other = nameA === 'all' ? nameB : nameA;
		return other !== 'direction' && other !== 'unicode-bidi';
	}
	if (nameA.startsWith(`${nameB}-`) || nameB.startsWith(`${nameA}-`)) {
		// e.g. `margin` and `margin-inline-start`
		return true;
	}
	// e.g. `border-width` and `border-top`, `margin` and `margin-inline-start`
	const longhandsA = getLonghands(nameA);
	const longhandsB = getLonghands(nameB);
	return longhandsA.some((la) =>
		longhandsB.some((lb) => la === lb || isSameFlowRelativeProperty(la, lb))
	);
}

/**
 * Checks whether moving the given node to a style directive can change the style.
 * Style directives are applied after the style attribute, so it can change the style
 * if a later declaration in the attribute or a style directive sets an overlapping property.
 * When the value is dynamic, an earlier declaration can also change the style:
 * Svelte updates a directive with `setProperty()` / `removeProperty()`,
 * so an empty, invalid or `null` value no longer falls back to the earlier declaration.
 */
function hasOverlappingProperty(
	attrNode: AST.SvelteAttribute,
	root: SvelteStyleRoot<AST.SvelteMustacheTagText>,
	node:
		| SvelteStyleDeclaration<AST.SvelteMustacheTagText>
		| SvelteStyleInline<AST.SvelteMustacheTagText>,
	propName: string,
	dynamic: boolean
): boolean {
	const index = root.nodes.indexOf(node);
	for (const other of root.nodes) {
		if (other === node || (!dynamic && root.nodes.indexOf(other) < index)) continue;
		if (other.type === 'decl') {
			if (isOverlappingProperty(propName, other.prop.name)) return true;
		} else if (other.type === 'inline') {
			for (const inlineRoot of other.getAllInlineStyles().values()) {
				for (const inlineNode of inlineRoot.nodes) {
					if (inlineNode.type === 'decl' && isOverlappingProperty(propName, inlineNode.prop.name))
						return true;
				}
			}
		}
	}
	return attrNode.parent.attributes.some(
		(attr) =>
			attr.type === 'SvelteStyleDirective' && isOverlappingProperty(propName, attr.key.name.name)
	);
}

export default createRule('prefer-style-directive', {
	meta: {
		docs: {
			description: 'require style directives instead of style attribute',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Can use style directives instead.'
		},
		type: 'suggestion'
	},
	create(context) {
		const sourceCode = context.sourceCode;

		/**
		 * Process for `style=" ... "`
		 */
		function processStyleValue(
			node: AST.SvelteAttribute,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>
		) {
			const propNames = getPropNames(root);

			/** Checks whether the given property is set more than once in the style attribute */
			function isDuplicated(name: string) {
				const normalized = normalizePropName(name);
				return propNames.filter((n) => n === normalized).length > 1;
			}

			for (const child of root.nodes) {
				if (child.type === 'decl') {
					processDeclaration(node, root, child, isDuplicated);
				} else if (child.type === 'inline') {
					processInline(node, root, child, isDuplicated);
				}
			}
		}

		/**
		 * Process for declaration
		 */
		function processDeclaration(
			attrNode: AST.SvelteAttribute,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>,
			decl: SvelteStyleDeclaration<AST.SvelteMustacheTagText>,
			isDuplicated: (name: string) => boolean
		) {
			if (decl.important || decl.unknownInterpolations.length || decl.prop.interpolations.length)
				return;
			if (
				attrNode.parent.attributes.some(
					(attr) => attr.type === 'SvelteStyleDirective' && attr.key.name.name === decl.prop.name
				)
			) {
				// has style directive
				return;
			}
			context.report({
				node: attrNode,
				loc: decl.loc,
				messageId: 'unexpected',
				*fix(fixer) {
					// A style directive always wins over the style attribute,
					// so moving a property that is set twice can change the style.
					if (isDuplicated(decl.prop.name)) return;
					if (
						hasOverlappingProperty(
							attrNode,
							root,
							decl,
							decl.prop.name,
							decl.value.interpolations.length > 0
						)
					)
						return;
					// Use the value that PostCSS gives. It has no comments.
					const value = decl.value.value;
					let valueWithoutInterpolations = value;
					for (const interpolation of decl.value.interpolations) {
						valueWithoutInterpolations = valueWithoutInterpolations.replace(
							sourceCode.getText(interpolation),
							''
						);
					}
					// The directive value is quoted with `"`.
					if (valueWithoutInterpolations.includes('"')) return;
					const styleDirective = `style:${decl.prop.name}="${value}"`;
					if (root.nodes.length === 1 && root.nodes[0] === decl) {
						yield fixer.replaceTextRange(attrNode.range, styleDirective);
					} else {
						yield removeStyle(fixer, root, decl);
						if (root.nodes[0] === decl) {
							yield fixer.insertTextBeforeRange(attrNode.range, `${styleDirective} `);
						} else {
							yield fixer.insertTextAfterRange(attrNode.range, ` ${styleDirective}`);
						}
					}
				}
			});
		}

		/**
		 * Process for inline
		 */
		function processInline(
			attrNode: AST.SvelteAttribute,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>,
			inline: SvelteStyleInline<AST.SvelteMustacheTagText>,
			isDuplicated: (name: string) => boolean
		) {
			const node = inline.node.expression;

			if (node.type !== 'ConditionalExpression') {
				return;
			}
			if (!isStringLiteral(node.consequent) || !isStringLiteral(node.alternate)) {
				return;
			}
			if (node.consequent.value && node.alternate.value) {
				// e.g. t ? 'top: 20px' : 'left: 30px'
				return;
			}

			const positive = !node.alternate.value;
			const inlineRoot = inline.getInlineStyle(positive ? node.consequent : node.alternate);
			if (!inlineRoot || inlineRoot.nodes.length !== 1) {
				return;
			}
			const decl = inlineRoot.nodes[0];
			if (decl.type !== 'decl') {
				return;
			}
			if (
				attrNode.parent.attributes.some(
					(attr) => attr.type === 'SvelteStyleDirective' && attr.key.name.name === decl.prop.name
				)
			) {
				// has style directive
				return;
			}

			context.report({
				node,
				messageId: 'unexpected',
				*fix(fixer) {
					// A style directive always wins over the style attribute,
					// so moving a property that is set twice can change the style.
					if (isDuplicated(decl.prop.name)) return;
					// The value is `null` in one case, so it is always dynamic.
					if (hasOverlappingProperty(attrNode, root, inline, decl.prop.name, true)) return;
					let valueText = sourceCode.text.slice(node.test.range[0], node.consequent.range[0]);
					if (positive) {
						valueText +=
							sourceCode.text[node.consequent.range[0]] +
							decl.value.value +
							sourceCode.text[node.consequent.range[1] - 1];
					} else {
						valueText += 'null';
					}
					valueText += sourceCode.text.slice(node.consequent.range[1], node.alternate.range[0]);
					if (positive) {
						valueText += 'null';
					} else {
						valueText +=
							sourceCode.text[node.alternate.range[0]] +
							decl.value.value +
							sourceCode.text[node.alternate.range[1] - 1];
					}
					const styleDirective = `style:${decl.prop.name}${
						decl.important ? '|important' : ''
					}={${valueText}}`;
					if (root.nodes.length === 1 && root.nodes[0] === inline) {
						yield fixer.replaceTextRange(attrNode.range, styleDirective);
					} else {
						yield removeStyle(fixer, root, inline);
						if (root.nodes[0] === inline) {
							yield fixer.insertTextBeforeRange(attrNode.range, `${styleDirective} `);
						} else {
							yield fixer.insertTextAfterRange(attrNode.range, ` ${styleDirective}`);
						}
					}
				}
			});
		}

		/** Remove style */
		function removeStyle(
			fixer: RuleFixer,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>,
			node:
				| SvelteStyleDeclaration<AST.SvelteMustacheTagText>
				| SvelteStyleInline<AST.SvelteMustacheTagText>
		) {
			const index = root.nodes.indexOf(node);
			const after = root.nodes[index + 1];
			if (after) {
				return fixer.removeRange([node.range[0], after.range[0]]);
			}
			const before = root.nodes[index - 1];
			if (before) {
				return fixer.removeRange([before.range[1], node.range[1]]);
			}
			return fixer.removeRange(node.range);
		}

		return {
			'SvelteStartTag > SvelteAttribute'(
				node: AST.SvelteAttribute & {
					parent: AST.SvelteStartTag;
				}
			) {
				if (!isHTMLElementLike(node.parent.parent) || node.key.name !== 'style') {
					return;
				}
				const root = parseStyleAttributeValue(node, context);
				if (root) {
					processStyleValue(node, root);
				}
			}
		};
	}
});
