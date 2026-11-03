import { createRule } from '../utils/index.js';

export default createRule('no-nested-style-tag', {
	meta: {
		docs: {
			description: 'disallow `<style>` elements nested inside other elements or blocks',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {
			nestedStyle:
				'Nested `<style>` elements are not scoped and may lead to unintended styles being applied.'
		},
		type: 'problem'
	},
	create(context) {
		return {
			SvelteElement(node) {
				if (node.kind !== 'html' || node.name.type !== 'SvelteName' || node.name.name !== 'style') {
					return;
				}
				context.report({ node, messageId: 'nestedStyle' });
			}
		};
	}
});
