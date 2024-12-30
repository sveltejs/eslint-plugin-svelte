import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

export default createRule('require-each-key', {
	meta: {
		docs: {
			description: 'require keyed `{#each}` block',
			category: 'Best Practices',
			configNames: ['recommended', 'recommended_svelte5_without_legacy', 'recommended_svelte3_4']
		},
		schema: [],
		messages: { expectedKey: 'Each block should have a key' },
		type: 'suggestion'
	},
	create(context) {
		return {
			SvelteEachBlock(node: AST.SvelteEachBlock) {
<<<<<<< HEAD
				// NO need a `key` if an each blocks without an item
=======
				// No need a `key` if an each blocks without an item
>>>>>>> origin/main
				// see: https://svelte.dev/docs/svelte/each#Each-blocks-without-an-item
				if (node.context != null && node.key == null) {
					context.report({
						node,
						messageId: 'expectedKey'
					});
				}
			}
		};
	}
});
