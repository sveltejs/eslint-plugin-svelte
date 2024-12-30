import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type {
	SvelteStyleDeclaration,
	SvelteStyleInline,
	SvelteStyleRoot
} from '../utils/css-utils/index.js';
import { parseStyleAttributeValue } from '../utils/css-utils/index.js';
import type { RuleFixer } from '../types.js';
import { isHTMLElementLike } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

/** Checks wether the given node is string literal or not  */
function isStringLiteral(node: TSESTree.Expression): node is TSESTree.StringLiteral {
	return node.type === 'Literal' && typeof node.value === 'string';
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
		const sourceCode = getSourceCode(context);

		/**
		 * Process for `style=" ... "`
		 */
		function processStyleValue(
			node: AST.SvelteAttribute,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>
		) {
			for (const child of root.nodes) {
				if (child.type === 'decl') {
					processDeclaration(node, root, child);
				} else if (child.type === 'inline') {
					processInline(node, root, child);
				}
			}
		}

		/**
		 * Process for declaration
		 */
		function processDeclaration(
			attrNode: AST.SvelteAttribute,
			root: SvelteStyleRoot<AST.SvelteMustacheTagText>,
			decl: SvelteStyleDeclaration<AST.SvelteMustacheTagText>
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
					const styleDirective = `style:${decl.prop.name}="${sourceCode.text.slice(
						...decl.value.range
					)}"`;
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
			inline: SvelteStyleInline<AST.SvelteMustacheTagText>
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
					const styleDirective = `style:${decl.prop.name}={${valueText}}`;
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
