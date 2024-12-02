import { createRule } from '../utils/index.js';

export default createRule('no-inline-styles', {
	meta: {
		docs: {
			description: 'disallow attributes and directives that produce inline styles',
			category: 'Best Practices',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowTransitions: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			hasStyleAttribute: 'Found disallowed style attribute.',
			hasStyleDirective: 'Found disallowed style directive.',
			hasTransition: 'Found disallowed transition.'
		},
		type: 'suggestion'
	},
	create(context) {
		const allowTransitions: boolean = context.options[0]?.allowTransitions ?? true;
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
					if (
						!allowTransitions &&
						attribute.type === 'SvelteDirective' &&
						attribute.kind === 'Transition'
					) {
						context.report({ loc: attribute.loc, messageId: 'hasTransition' });
					}
				}
			}
		};
	}
});
