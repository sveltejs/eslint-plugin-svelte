import type { TSESTree } from '@typescript-eslint/types';
import { keyword } from 'esutils';
import { createRule } from '../utils/index.js';

/**
 * Get the component name expected for the given `.svelte` file name.
 * Returns `null` if no valid identifier can be derived from it.
 */
function getExpectedName(fileName: string): string | null {
	const name = fileName
		.split(/[^\p{L}\p{N}$]+/u)
		.filter(Boolean)
		.map((word) => word[0].toUpperCase() + word.slice(1))
		.join('');
	return keyword.isIdentifierNameES6(name) ? name : null;
}

/**
 * Get the file name, without the `.svelte` extension, from the given module source.
 * Returns `null` if the source does not refer to a `.svelte` file.
 */
function getComponentFileName(source: string): string | null {
	if (!source.endsWith('.svelte')) {
		return null;
	}
	const fileName = source.slice(source.lastIndexOf('/') + 1, -'.svelte'.length);
	return fileName || null;
}

/**
 * Get the name of the given import or export specifier part, which may be a string literal.
 */
function getModuleExportName(node: TSESTree.Identifier | TSESTree.StringLiteral): string {
	return node.type === 'Identifier' ? node.name : node.value;
}

export default createRule('no-component-import-rename', {
	meta: {
		docs: {
			description: 'disallow importing components under a name that does not match their file name',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [],
		messages: {
			unexpected: "Component '{{name}}' should be named '{{expected}}' to match its file name."
		},
		type: 'suggestion'
	},
	create(context) {
		/**
		 * Report the given name if it does not match the file name of the component imported from the given source.
		 */
		function verify(source: string, nameNode: TSESTree.Identifier | TSESTree.StringLiteral) {
			const fileName = getComponentFileName(source);
			if (fileName == null) {
				return;
			}
			const expected = getExpectedName(fileName);
			if (expected == null) {
				return;
			}
			const name = getModuleExportName(nameNode);
			if (name === fileName || name === expected) {
				return;
			}
			context.report({
				node: nameNode,
				messageId: 'unexpected',
				data: { name, expected }
			});
		}

		return {
			ImportDeclaration(node) {
				for (const specifier of node.specifiers) {
					if (
						specifier.type === 'ImportDefaultSpecifier' ||
						(specifier.type === 'ImportSpecifier' &&
							getModuleExportName(specifier.imported) === 'default')
					) {
						// import Foo from './Foo.svelte';
						// import { default as Foo } from './Foo.svelte';
						verify(node.source.value, specifier.local);
					}
				}
			},
			ExportNamedDeclaration(node) {
				if (!node.source) {
					return;
				}
				for (const specifier of node.specifiers) {
					if (
						getModuleExportName(specifier.local) === 'default' &&
						getModuleExportName(specifier.exported) !== 'default'
					) {
						// export { default as Foo } from './Foo.svelte';
						verify(node.source.value, specifier.exported);
					}
				}
			}
		};
	}
});
