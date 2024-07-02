import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils';

export default createRule('rune-prefer-let', {
	meta: {
		docs: {
			description: 'use let instead of const for reactive variables created by runes',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			useLet: "const is used for a reactive variable from {{rune}}. Use 'let' instead."
		},
		type: 'suggestion',
		fixable: 'code'
	},
	create(context) {
		function preferLet(node: TSESTree.VariableDeclaration, rune: string) {
			if (node.kind !== 'const') {
				return;
			}
			context.report({
				node,
				messageId: 'useLet',
				data: { rune },
				fix: (fixer) => fixer.replaceTextRange([node.range[0], node.range[0] + 5], 'let')
			});
		}

		return {
			'VariableDeclaration > VariableDeclarator > CallExpression > Identifier'(
				node: TSESTree.Identifier
			) {
				if (['$props', '$derived', '$state'].includes(node.name)) {
					preferLet(node.parent.parent?.parent as TSESTree.VariableDeclaration, `${node.name}()`);
				}
			},
			'VariableDeclaration > VariableDeclarator > CallExpression > MemberExpression > Identifier'(
				node: TSESTree.Identifier
			) {
				if (
					node.name === 'by' &&
					((node.parent as TSESTree.MemberExpression).object as TSESTree.Identifier).name ===
						'$derived'
				) {
					preferLet(
						node.parent.parent?.parent?.parent as TSESTree.VariableDeclaration,
						'$derived.by()'
					);
				}
				if (
					node.name === 'frozen' &&
					((node.parent as TSESTree.MemberExpression).object as TSESTree.Identifier).name ===
						'$state'
				) {
					preferLet(
						node.parent.parent?.parent?.parent as TSESTree.VariableDeclaration,
						'$state.frozen()'
					);
				}
			}
		};
	}
});
