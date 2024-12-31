import { createRule } from '../utils/index.js';

export default createRule('no-useless-children-snippet', {
	meta: {
		docs: {
			description: "disallow explicit children snippet where it's not needed",
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			uselessSnippet: 'Found an unnecessary children snippet.'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			SvelteSnippetBlock(node) {
				if (
					node.parent.type === 'SvelteElement' &&
					node.id.name === 'children' &&
					node.params.length === 0
				) {
					context.report({ node, messageId: 'uselessSnippet' });
				}
			}
		};
	}
});
