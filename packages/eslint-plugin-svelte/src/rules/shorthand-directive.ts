import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getAttributeValueQuoteAndRange } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('shorthand-directive', {
	meta: {
		docs: {
			description: 'enforce use of shorthand syntax in directives',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: true
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					prefer: { enum: ['always', 'never'] }
				},
				additionalProperties: false
			}
		],
		messages: {
			expectedShorthand: 'Expected shorthand directive.',
			expectedRegular: 'Expected regular directive syntax.'
		},
		type: 'layout'
	},
	create(context) {
		const sourceCode = getSourceCode(context);
		const always: boolean = context.options[0]?.prefer !== 'never';

		/** Report for always */
		function reportForAlways(
			node: AST.SvelteBindingDirective | AST.SvelteClassDirective | AST.SvelteStyleDirective
		) {
			context.report({
				node,
				messageId: 'expectedShorthand',
				*fix(fixer) {
					const quoteAndRange = getAttributeValueQuoteAndRange(node, sourceCode);
					if (quoteAndRange) {
						yield fixer.remove(sourceCode.getTokenBefore(quoteAndRange.firstToken)!);
						yield fixer.removeRange(quoteAndRange.range);
					}
				}
			});
		}

		/** Report for never */
		function reportForNever(
			node: AST.SvelteBindingDirective | AST.SvelteClassDirective | AST.SvelteStyleDirective
		) {
			context.report({
				node,
				messageId: 'expectedRegular',
				*fix(fixer) {
					yield fixer.insertTextAfter(node.key.name, `={${node.key.name.name}}`);
				}
			});
		}

		return {
			SvelteDirective(node) {
				if (node.kind !== 'Binding' && node.kind !== 'Class') {
					return;
				}

				const expression = node.expression;
				if (
					!expression ||
					expression.type !== 'Identifier' ||
					node.key.name.name !== expression.name
				) {
					// Cannot use shorthand
					return;
				}
				if (always) {
					if (node.shorthand) {
						// Use shorthand
						return;
					}
					reportForAlways(node);
				} else {
					if (!node.shorthand) {
						// Use longform
						return;
					}
					reportForNever(node);
				}
			},
			SvelteStyleDirective(node) {
				if (always) {
					if (node.shorthand) {
						// Use shorthand
						return;
					}
					if (node.value.length !== 1) {
						// Cannot use shorthand
						return;
					}
					const expression = node.value[0];
					if (
						expression.type !== 'SvelteMustacheTag' ||
						expression.expression.type !== 'Identifier' ||
						expression.expression.name !== node.key.name.name
					) {
						// Cannot use shorthand
						return;
					}
					reportForAlways(node);
				} else {
					if (!node.shorthand) {
						// Use longform
						return;
					}
					reportForNever(node);
				}
			}
		};
	}
});
