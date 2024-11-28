import { createRule } from '../utils/index.js';
import { getAttributeValueQuoteAndRange } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('shorthand-attribute', {
	meta: {
		docs: {
			description: 'enforce use of shorthand syntax in attribute',
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
			expectedShorthand: 'Expected shorthand attribute.',
			expectedRegular: 'Expected regular attribute syntax.'
		},
		type: 'layout' // "problem", or "layout",
	},
	create(context) {
		const sourceCode = getSourceCode(context);
		const always: boolean = context.options[0]?.prefer !== 'never';

		return always
			? {
					SvelteAttribute(node) {
						if (node.value.length !== 1) {
							return;
						}
						const value = node.value[0];
						if (value.type !== 'SvelteMustacheTag' || value.expression.type !== 'Identifier') {
							return;
						}
						if (node.key.name === value.expression.name) {
							context.report({
								node,
								messageId: 'expectedShorthand',
								*fix(fixer) {
									const quoteAndRange = getAttributeValueQuoteAndRange(node, sourceCode);
									if (!quoteAndRange) {
										return;
									}
									if (quoteAndRange.quote === 'double' || quoteAndRange.quote === 'single') {
										yield fixer.removeRange([node.range[0], quoteAndRange.firstToken.range[1]]);
										yield fixer.remove(quoteAndRange.lastToken);
									} else {
										yield fixer.removeRange([node.range[0], quoteAndRange.range[0]]);
									}
								}
							});
						}
					}
				}
			: {
					SvelteShorthandAttribute(node) {
						context.report({
							node,
							messageId: 'expectedRegular',
							fix(fixer) {
								return fixer.insertTextBefore(node, `${node.key.name}=`);
							}
						});
					}
				};
	}
});
