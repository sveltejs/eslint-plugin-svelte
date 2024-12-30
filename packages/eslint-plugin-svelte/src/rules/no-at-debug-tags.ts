import { createRule } from '../utils/index.js';

export default createRule('no-at-debug-tags', {
	meta: {
		docs: {
			description: 'disallow the use of `{@debug}`',
			category: 'Best Practices',
			configNames: ['recommended', 'recommended_svelte5_without_legacy', 'recommended_svelte3_4'],
			default: 'warn'
		},
		schema: [],
		messages: {
			unexpected: 'Unexpected `{@debug}`.'
		},
		type: 'problem'
	},
	create(context) {
		return {
			SvelteDebugTag(node) {
				context.report({
					node,
					messageId: 'unexpected'
				});
			}
		};
	}
});
