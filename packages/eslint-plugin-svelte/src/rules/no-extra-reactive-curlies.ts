import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-extra-reactive-curlies', {
	meta: {
		docs: {
			description: 'disallow wrapping single reactive statements in curly braces',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			extraCurlies: `Do not wrap reactive statements in curly braces unless necessary.`,
			removeExtraCurlies: `Remove the unnecessary curly braces.`
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			// $: { foo = "bar"; }
			[`SvelteReactiveStatement > BlockStatement[body.length=1]`]: (
				node: TSESTree.BlockStatement
			) => {
				const source = getSourceCode(context);

				return context.report({
					node,
					loc: node.loc,
					messageId: 'extraCurlies',
					suggest: [
						{
							messageId: 'removeExtraCurlies',
							fix(fixer) {
								const tokens = source.getTokens(node, { includeComments: true });

								// Remove everything up to the second token, and the entire last token since
								// those are known to be "{" and "}"
								return [
									fixer.removeRange([tokens[0].range[0], tokens[1].range[0]]),

									fixer.removeRange([
										tokens[tokens.length - 2].range[1],
										tokens[tokens.length - 1].range[1]
									])
								];
							}
						}
					]
				});
			}
		};
	}
});
