import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';

export default createRule('no-inspect', {
	meta: {
		docs: {
			description: 'Warns against the use of `$inspect` directive',
			category: 'Best Practices',
			recommended: true,
			default: 'warn'
		},
		schema: [],
		messages: {
			unexpected: 'Do not use $inspect directive'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		]
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
