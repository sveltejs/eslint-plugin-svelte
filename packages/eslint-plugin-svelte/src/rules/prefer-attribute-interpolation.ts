import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

/** Check whether an escape has distinct runtime semantics. */
function hasUsefulStringEscape(rawValue: string, strValue: string): boolean {
	if (rawValue === strValue) {
		return false;
	}

	const chars = [...rawValue];
	let char = chars.shift();
	while (char) {
		if (char === '\\') {
			char = chars.shift();
			if (char == null || 'nrvtbfux'.includes(char)) {
				return true;
			}
		}
		char = chars.shift();
	}
	return false;
}

export default createRule('prefer-attribute-interpolation', {
	meta: {
		docs: {
			description: 'require attribute interpolation instead of template literals',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [],
		messages: {
			unexpected: 'Prefer attribute interpolation over a template literal.'
		},
		type: 'suggestion'
	},
	create(context) {
		const sourceCode = context.sourceCode;

		return {
			SvelteAttribute(node: AST.SvelteAttribute) {
				if (node.value.length !== 1) {
					return;
				}

				const value = node.value[0];
				if (
					value.type !== 'SvelteMustacheTag' ||
					value.expression.type !== 'TemplateLiteral' ||
					value.expression.expressions.length === 0
				) {
					return;
				}

				if (
					sourceCode
						.getTokens(value, { includeComments: true })
						.some((token) => token.type === 'Block' || token.type === 'Line')
				) {
					return;
				}

				if (
					value.expression.quasis.some(
						(quasi) =>
							/[\n\r]/u.test(quasi.value.raw) ||
							quasi.value.raw.includes('{') ||
							hasUsefulStringEscape(quasi.value.raw, quasi.value.cooked ?? quasi.value.raw)
					)
				) {
					return;
				}

				context.report({
					node: value,
					messageId: 'unexpected'
				});
			}
		};
	}
});
