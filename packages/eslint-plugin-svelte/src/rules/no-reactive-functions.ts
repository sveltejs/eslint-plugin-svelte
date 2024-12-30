import type { TSESTree } from '@typescript-eslint/types';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-reactive-functions', {
	meta: {
		docs: {
			description: "it's not necessary to define functions in reactive statements",
			category: 'Best Practices',
			recommended: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			noReactiveFns: `Do not create functions inside reactive statements unless absolutely necessary.`,
			fixReactiveFns: `Move the function out of the reactive statement`
		},
		type: 'suggestion' // "problem", or "layout",
	},
	create(context) {
		return {
			// $: foo = () => { ... }
			[`SvelteReactiveStatement > ExpressionStatement > AssignmentExpression > :function`](
				node: TSESTree.ArrowFunctionExpression
			) {
				// Move upwards to include the entire label
				const parent = node.parent?.parent?.parent;

				if (!parent) {
					return false;
				}

				const source = getSourceCode(context);

				return context.report({
					node: parent,
					loc: parent.loc,
					messageId: 'noReactiveFns',
					suggest: [
						{
							messageId: 'fixReactiveFns',
							fix(fixer) {
								const tokens = source.getFirstTokens(parent, {
									includeComments: false,
									count: 3
								});

								const noExtraSpace = source.isSpaceBetweenTokens(
									tokens[1] as AST.Token,
									tokens[2] as AST.Token
								);

								// Replace the entire reactive label with "const"
								return fixer.replaceTextRange(
									[tokens[0].range[0], tokens[1].range[1]],
									noExtraSpace ? 'const' : 'const '
								);
							}
						}
					]
				});
			}
		};
	}
});
