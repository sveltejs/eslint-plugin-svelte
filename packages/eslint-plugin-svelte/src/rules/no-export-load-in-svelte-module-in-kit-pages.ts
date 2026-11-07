import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { findVariable, isModuleScript } from '../utils/ast-utils.js';

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
		/** Report the given exported name if it is `load` */
		function verify(name: TSESTree.Node | null) {
			if (
				(name?.type === 'Identifier' && name.name === 'load') ||
				(name?.type === 'Literal' && name.value === 'load')
			) {
				context.report({ node: name, messageId: 'unexpected' });
			}
		}

		/** Checks whether the given node exports a value from `<script module>` */
		function isModuleValueExport(
			node: TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration
		) {
			return (
				node.exportKind !== 'type' &&
				isModuleScript(node.parent as unknown as AST.SvelteScriptElement)
			);
		}

		return {
			// export function load() {}
			// export const { load } = obj
			// export { foo as load }
			'SvelteScriptElement > ExportNamedDeclaration'(node: TSESTree.ExportNamedDeclaration) {
				if (!isModuleValueExport(node)) return;
				const declaration = node.declaration;
				if (declaration?.type === 'VariableDeclaration') {
					for (const variable of context.sourceCode.getDeclaredVariables(declaration)) {
						for (const def of variable.defs) {
							if (def.parent === declaration) verify(def.name);
						}
					}
				} else if (
					declaration?.type === 'FunctionDeclaration' ||
					declaration?.type === 'ClassDeclaration' ||
					(declaration?.type === 'TSImportEqualsDeclaration' && declaration.importKind !== 'type')
				) {
					verify(declaration.id);
				}
				for (const specifier of node.specifiers) {
					// A local type can be exported without an explicit `type` modifier.
					if (
						!node.source &&
						specifier.local.type === 'Identifier' &&
						findVariable(context, specifier.local)?.isValueVariable === false
					) {
						continue;
					}
					if (specifier.exportKind !== 'type') verify(specifier.exported);
				}
			},

			// export * as load from './foo'
			'SvelteScriptElement > ExportAllDeclaration'(node: TSESTree.ExportAllDeclaration) {
				if (!isModuleValueExport(node)) return;
				verify(node.exported);
			}
		};
	}
});
