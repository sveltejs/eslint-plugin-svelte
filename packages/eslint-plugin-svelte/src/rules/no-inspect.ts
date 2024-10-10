import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils';

export default createRule('no-inspect', {
	meta: {
		docs: {
			description: '',
			category: 'Best Practices',
			recommended: true,
			default: 'warn'
		},
		schema: [],
		messages: {
			unexpected: 'Do not use $inspect directive'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			Identifier(node: TSESTree.Identifier) {
				if (node.name !== '$inspect') {
					return;
				}

				context.report({ messageId: 'unexpected', node });
			}
		};
	}
});
