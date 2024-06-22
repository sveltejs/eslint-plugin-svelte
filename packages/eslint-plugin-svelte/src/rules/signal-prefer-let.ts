import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils';

export default createRule('signal-prefer-let', {
	meta: {
		docs: {
			description: 'use let instead of const for signals values',
			category: 'Best Practices',
			recommended: false
		},
		schema: [],
		messages: {
			useLet: "const is used for a signal value. Use 'let' instead."
		},
		type: 'suggestion',
		fixable: 'code'
	},
	create(context) {
		function preferLet(node: TSESTree.VariableDeclaration) {
			if (node.kind !== 'const') {
				return;
			}
			context.report({
				node,
				messageId: 'useLet',
				fix: (fixer) => fixer.replaceTextRange([node.range[0], node.range[0] + 5], 'let')
			});
		}

		return {
			'VariableDeclaration > VariableDeclarator > CallExpression > Identifier'(
				node: TSESTree.Identifier
			) {
				if (['$props', '$derived', '$state'].includes(node.name)) {
					preferLet(node.parent.parent?.parent as TSESTree.VariableDeclaration);
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
					preferLet(node.parent.parent?.parent?.parent as TSESTree.VariableDeclaration);
				}
			}
		};
	}
});
