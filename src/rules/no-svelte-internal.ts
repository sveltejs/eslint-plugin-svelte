import { createRule } from '../utils';

export default createRule('no-svelte-internal', {
	meta: {
		docs: {
			description: 'svelte/internal will be removed in Svelte 6.',
			category: 'Best Practices',
			// TODO Switch to recommended in the major version.
			// recommended: true,
			recommended: false
		},
		schema: [],
		messages: {
			unexpected: 'Importing from svelte/internal is prohibited. This will be removed in Svelte 6.'
		},
		type: 'problem'
	},
	create(context) {
		return {
			ImportDeclaration(node) {
				if (node.source.value === 'svelte/internal') {
					context.report({
						node,
						messageId: 'unexpected'
					});
				}
			}
		};
	}
});
