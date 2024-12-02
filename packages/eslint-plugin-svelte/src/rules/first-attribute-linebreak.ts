import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('first-attribute-linebreak', {
	meta: {
		docs: {
			description: 'enforce the location of first attribute',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: true
		},
		fixable: 'whitespace',
		schema: [
			{
				type: 'object',
				properties: {
					multiline: { enum: ['below', 'beside'] },
					singleline: { enum: ['below', 'beside'] }
				},
				additionalProperties: false
			}
		],
		messages: {
			expected: 'Expected a linebreak before this attribute.',
			unexpected: 'Expected no linebreak before this attribute.'
		},
		type: 'layout'
	},
	create(context) {
		const multiline: 'below' | 'beside' = context.options[0]?.multiline || 'below';
		const singleline: 'below' | 'beside' = context.options[0]?.singleline || 'beside';
		const sourceCode = getSourceCode(context);

		/**
		 * Report attribute
		 */
		function report(
			firstAttribute: AST.SvelteStartTag['attributes'][number],
			location: 'below' | 'beside'
		) {
			context.report({
				node: firstAttribute,
				messageId: location === 'beside' ? 'unexpected' : 'expected',
				fix(fixer) {
					const prevToken = sourceCode.getTokenBefore(firstAttribute, {
						includeComments: true
					})!;
					return fixer.replaceTextRange(
						[prevToken.range[1], firstAttribute.range[0]],
						location === 'beside' ? ' ' : '\n'
					);
				}
			});
		}

		return {
			SvelteStartTag(node) {
				const firstAttribute = node.attributes[0];
				if (!firstAttribute) return;

				const lastAttribute = node.attributes[node.attributes.length - 1];

				const location =
					firstAttribute.loc.start.line === lastAttribute.loc.end.line ? singleline : multiline;

				if (location === 'beside') {
					if (node.parent.name.loc.end.line === firstAttribute.loc.start.line) {
						return;
					}
				} else if (node.parent.name.loc.end.line < firstAttribute.loc.start.line) {
					return;
				}
				report(firstAttribute, location);
			}
		};
	}
});
