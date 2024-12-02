import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';

export default createRule('no-inspect', {
	meta: {
		docs: {
			description: 'Warns against the use of `$inspect` directive',
			category: 'Best Practices',
			// TODO: Enable recommended in major version
			recommended: false,
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
