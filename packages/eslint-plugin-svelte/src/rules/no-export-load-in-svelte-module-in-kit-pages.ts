import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { isModuleScript } from '../utils/ast-utils.js';

export default createRule('no-export-load-in-svelte-module-in-kit-pages', {
	meta: {
		docs: {
			description:
				'disallow exporting load functions in `*.svelte` module in SvelteKit page components.',
			category: 'SvelteKit',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected:
				'disallow exporting load functions in `*.svelte` module in SvelteKit page components.'
		},
		type: 'problem',
		conditions: [
			{
				svelteKitFileTypes: ['+page.svelte', '+error.svelte', '+layout.svelte']
			}
		]
	},
	create(context) {
		let isModule = false;
		return {
			// <script module>, <script context="module">
			'Program > SvelteScriptElement': (node: AST.SvelteScriptElement) => {
				isModule = isModuleScript(node);
			},

			// </script>
			'Program > SvelteScriptElement:exit': () => {
				isModule = false;
			},

			// export function load() {}
			// export const load = () => {}
			[`:matches(ExportNamedDeclaration > FunctionDeclaration, ExportNamedDeclaration > VariableDeclaration > VariableDeclarator) > Identifier.id[name="load"]`]:
				(node: TSESTree.Identifier) => {
					if (!isModule) return {};
					return context.report({
						node,
						loc: node.loc,
						messageId: 'unexpected'
					});
				}
		};
	}
});
