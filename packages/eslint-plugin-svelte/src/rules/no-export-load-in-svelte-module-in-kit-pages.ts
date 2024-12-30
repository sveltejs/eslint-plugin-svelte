import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { isKitPageComponent } from '../utils/svelte-kit.js';

export default createRule('no-export-load-in-svelte-module-in-kit-pages', {
	meta: {
		docs: {
			description:
				'disallow exporting load functions in `*.svelte` module in SvelteKit page components.',
			category: 'Possible Errors',
			// TODO Switch to recommended in the major version.
			recommended: false
		},
		schema: [],
		messages: {
			unexpected:
				'disallow exporting load functions in `*.svelte` module in SvelteKit page components.'
		},
		type: 'problem'
	},
	create(context) {
		if (!isKitPageComponent(context)) {
			return {};
		}
		let isModule = false;
		return {
			// <script context="module">
			[`Program > SvelteScriptElement > SvelteStartTag > SvelteAttribute[key.name="context"] > SvelteLiteral[value="module"]`]:
				() => {
					isModule = true;
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
