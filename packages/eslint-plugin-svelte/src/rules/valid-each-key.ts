import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getScope } from '../utils/ast-utils.js';

export default createRule('valid-each-key', {
	meta: {
		docs: {
			description: 'enforce keys to use variables defined in the `{#each}` block',
			category: 'Best Practices',
			// TODO Switch to recommended in the major version.
			recommended: false
		},
		schema: [],
		messages: {
			keyUseEachVars: 'Expected key to use the variables which are defined by the `{#each}` block.'
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			SvelteEachBlock(node: AST.SvelteEachBlock) {
				if (node.key == null) {
					return;
				}
				const scope = getScope(context, node.key);
				for (const variable of scope.variables) {
					if (
						!variable.defs.some(
							(def) =>
								(node.context &&
									node.context.range[0] <= def.name.range[0] &&
									def.name.range[1] <= node.context.range[1]) ||
								(node.index &&
									node.index.range[0] <= def.name.range[0] &&
									def.name.range[1] <= node.index.range[1]) ||
								(node.expression &&
									node.expression.range[0] <= def.name.range[0] &&
									def.name.range[1] <= node.expression.range[1])
						)
					) {
						// It's not an iteration variable.
						continue;
					}
					for (const reference of variable.references) {
						if (
							node.key.range[0] <= reference.identifier.range[0] &&
							reference.identifier.range[1] <= node.key.range[1]
						) {
							// A variable is used in the key.
							return;
						}
					}
				}
				context.report({
					node: node.key,
					messageId: 'keyUseEachVars'
				});
			}
		};
	}
});
