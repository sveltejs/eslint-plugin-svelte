import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';
import type { SuggestionReportDescriptor } from '../types.js';

export default createRule('no-add-event-listener', {
	meta: {
		docs: {
			description: 'Warns against the use of `addEventListener`',
			category: 'Best Practices',
			recommended: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			unexpected:
				'Do not use `addEventListener`. Use the `on` function from `svelte/events` instead.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5']
			}
		]
	},
	create(context) {
		return {
			CallExpression(node: TSESTree.CallExpression) {
				const { callee, arguments: args } = node;
				let target: string | null = null;

				if (
					callee.type === 'MemberExpression' &&
					callee.property.type === 'Identifier' &&
					callee.property.name === 'addEventListener'
				) {
					target = context.sourceCode.getText(callee.object);
				} else if (callee.type === 'Identifier' && callee.name === 'addEventListener') {
					target = 'window';
				}

				if (target === null) {
					return;
				}

				const openParen = context.sourceCode.getTokenAfter(callee);
				const suggest: SuggestionReportDescriptor[] = [];

				if (openParen !== null) {
					suggest.push({
						desc: 'Use `on` from `svelte/events` instead',
						fix(fixer) {
							return [
								fixer.replaceText(callee, 'on'),
								fixer.insertTextAfter(openParen, `${target}, `)
							];
						}
					});
				}

				context.report({
					node,
					messageId: 'unexpected',
					suggest
				});
			}
		};
	}
});
