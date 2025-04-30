import { createRule } from '../utils/index.js';

export default createRule('no-at-debug-tags', {
	meta: {
		docs: {
			description: 'disallow the use of `{@debug}`',
			category: 'Best Practices',
			recommended: true,
			default: 'warn'
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			unexpected: 'Unexpected `{@debug}`.',
			suggestRemove: 'Remove `{@debug}` from the source'
		},
		type: 'problem'
	},
	create(context) {
		return {
			SvelteDebugTag(node) {
				context.report({
					node,
					messageId: 'unexpected',
					suggest: [
						{
							messageId: 'suggestRemove',
							fix: (fixer) => fixer.remove(node)
						}
					]
				});
			}
		};
	}
});
