import { createRule } from '../utils';

export default createRule('no-inline-styles', {
	meta: {
		docs: {
			description: 'disallow attributes and directives that produce inline styles',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			hasStyleAttribute: 'Found disallowed style attribute.',
			hasStyleDirective: 'Found disallowed style directive.'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			SvelteElement(node) {
				if (node.kind !== 'html') {
					return;
				}
				for (const attribute of node.startTag.attributes) {
					if (attribute.type === 'SvelteStyleDirective') {
						context.report({ loc: attribute.loc, messageId: 'hasStyleDirective' });
					}
					if (attribute.type === 'SvelteAttribute' && attribute.key.name === 'style') {
						context.report({ loc: attribute.loc, messageId: 'hasStyleAttribute' });
					}
				}
			}
		};
	}
});
