import { createRule } from '../utils/index.js';

export default createRule('no-at-const-tags', {
	meta: {
		docs: {
			description: 'disallow the use of `{@const}` in favor of `{const ...}` declaration tags',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Use `{const ...}` declaration tag instead of legacy `{@const ...}`.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5']
			}
		]
	},
	create(context) {
		const sourceCode = context.sourceCode;
		return {
			SvelteConstTag(node) {
				context.report({
					node,
					messageId: 'unexpected',
					fix(fixer) {
						const text = sourceCode.getText(node);
						const match = /^\{(\s*)@const\b/u.exec(text);
						if (!match) {
							return null;
						}
						const atOffset = node.range[0] + 1 + match[1].length;
						return fixer.removeRange([atOffset, atOffset + 1]);
					}
				});
			}
		};
	}
});
