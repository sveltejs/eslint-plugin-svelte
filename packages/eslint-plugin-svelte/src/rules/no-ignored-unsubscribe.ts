import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';

export default createRule('no-ignored-unsubscribe', {
	meta: {
		docs: {
			description:
				'disallow ignoring the unsubscribe method returned by the `subscribe()` on Svelte stores.',
			category: 'Best Practices',
			recommended: false
		},
		fixable: undefined,
		hasSuggestions: false,
		messages: {
			forbidden: 'Ignoring returned value of the subscribe method is forbidden.'
		},
		schema: [],
		type: 'problem'
	},
	create: (context) => {
		return {
			"ExpressionStatement > CallExpression > MemberExpression.callee[property.name='subscribe']": (
				node: TSESTree.MemberExpression
			) => {
				context.report({
					messageId: 'forbidden',
					node: node.property
				});
			}
		};
	}
});
