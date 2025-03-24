import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { getSourceCode } from '../utils/compat.js';
import { createRule } from '../utils/index.js';

export default createRule('prefer-svelte-reactivity', {
	meta: {
		docs: {
			description:
				'disallow using built-in classes where a reactive alternative is provided by svelte/reactivity',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			dateUsed: 'Found a usage of the built-in Date class. Use a SvelteDate instead.',
			mapUsed: 'Found a usage of the built-in Map class. Use a SvelteMap instead.',
			setUsed: 'Found a usage of the built-in Set class. Use a SvelteSet instead.',
			urlUsed: 'Found a usage of the built-in URL class. Use a SvelteURL instead.',
			urlSearchParamsUsed:
				'Found a usage of the built-in URLSearchParams class. Use a SvelteURLSearchParams instead.'
		},
		type: 'problem', // 'problem', or 'layout',
		conditions: [
			{
				svelteVersions: ['5'],
				svelteFileTypes: ['.svelte', '.svelte.[js|ts]']
			}
		]
	},
	create(context) {
		return {
			Program() {
				const referenceTracker = new ReferenceTracker(
					getSourceCode(context).scopeManager.globalScope!
				);
				for (const { node, path } of referenceTracker.iterateGlobalReferences({
					Date: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					Map: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					Set: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					URL: {
						[ReferenceTracker.CALL]: true,
						[ReferenceTracker.CONSTRUCT]: true,
						[ReferenceTracker.READ]: true
					},
					URLSearchParams: {
						[ReferenceTracker.CALL]: true,
						[ReferenceTracker.CONSTRUCT]: true,
						[ReferenceTracker.READ]: true
					}
				})) {
					const typeToMessageId: Record<string, string> = {
						Date: 'dateUsed',
						Map: 'mapUsed',
						Set: 'setUsed',
						URL: 'urlUsed',
						URLSearchParams: 'urlSearchParamsUsed'
					};
					context.report({
						messageId: typeToMessageId[path[0]],
						node
					});
				}
			}
		};
	}
});
