import { createRule } from '../utils/index.js';
import { extractStoreReferences } from './reference-helpers/svelte-store.js';

export default createRule('require-stores-init', {
	meta: {
		docs: {
			description: 'require initial value in store',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			storeDefaultValue: `Always set a default value for svelte stores.`
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			Program() {
				for (const { node, name } of extractStoreReferences(context)) {
					const minArgs =
						name === 'writable' || name === 'readable' ? 1 : name === 'derived' ? 3 : 0;

					if (
						node.arguments.length >= minArgs ||
						node.arguments.some((arg) => arg.type === 'SpreadElement')
					) {
						continue;
					}
					context.report({
						node,
						messageId: 'storeDefaultValue'
					});
				}
			}
		};
	}
});
