import { createRule } from '../utils';
import { parseStyleAttributeValue } from '../utils/css-utils';

export default createRule('require-optimized-style-attribute', {
	meta: {
		docs: {
			description: 'require style attributes that can be optimized',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			shorthand: 'It cannot be optimized because style attribute is specified using shorthand.',
			comment: 'It cannot be optimized because contains comments.',
			interpolationKey:
				'It cannot be optimized because property of style declaration contain interpolation.',
			complex: 'It cannot be optimized because too complex.'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			SvelteShorthandAttribute(node) {
				if (node.key.name !== 'style') {
					return;
				}

				context.report({
					node,
					messageId: 'shorthand'
				});
			},
			SvelteAttribute(node) {
				if (node.key.name !== 'style' || !node.value?.length) {
					return;
				}
				const root = parseStyleAttributeValue(node, context);
				if (!root) {
					context.report({
						node,
						messageId: 'complex'
					});
					return;
				}

				for (const child of root.nodes) {
					if (child.type === 'decl') {
						if (child.unknownInterpolations.length) {
							context.report({
								node,
								loc: child.loc,
								messageId: 'complex'
							});
						} else if (child.prop.interpolations.length) {
							context.report({
								node,
								loc: child.prop.loc,
								messageId: 'interpolationKey'
							});
						}
					} else if (child.type === 'comment') {
						context.report({
							node,
							loc: child.loc,
							messageId: 'comment'
						});
					} else {
						context.report({
							node,
							loc: child.loc,
							messageId: 'complex'
						});
					}
				}
			}
		};
	}
});
