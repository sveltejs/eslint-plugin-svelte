import { createRule } from '../utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';

export default createRule('no-svelte-internal', {
	meta: {
		docs: {
			description: 'svelte/internal will be removed in Svelte 6.',
			category: 'Best Practices',
			// TODO Switch to recommended in the major version.
			// recommended: true,
			recommended: false
		},
		schema: [],
		messages: {
			unexpected: 'Using svelte/internal is prohibited. This will be removed in Svelte 6.'
		},
		type: 'problem'
	},
	create(context) {
		function report(node: TSESTree.Node) {
			context.report({
				node,
				messageId: 'unexpected'
			});
		}

		function isSvelteInternal(value: string) {
			return value === 'svelte/internal' || value.startsWith('svelte/internal/');
		}

		return {
			ImportDeclaration(node) {
				if (node.source && isSvelteInternal(node.source.value)) {
					report(node);
				}
			},
			ImportExpression(node) {
				if (
					node.source &&
					node.source.type === 'Literal' &&
					typeof node.source.value === 'string' &&
					isSvelteInternal(node.source.value)
				) {
					report(node);
				}
			},
			ExportNamedDeclaration(node) {
				if (node.source && isSvelteInternal(node.source.value)) {
					report(node);
				}
			},
			ExportAllDeclaration(node) {
				if (node.source && isSvelteInternal(node.source.value)) {
					report(node);
				}
			}
		};
	}
});
