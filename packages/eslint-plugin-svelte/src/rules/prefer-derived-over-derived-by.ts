import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';

export default createRule('prefer-derived-over-derived-by', {
	meta: {
		docs: {
			description: 'disallow unnecessary `$derived.by()` when `$derived()` is sufficient',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unnecessary:
				'Unnecessary use of `$derived.by()`. Use `$derived()` directly for simple expressions.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		]
	},
	create(context) {
		return {
			CallExpression(node: TSESTree.CallExpression) {
				const { callee } = node;
				if (
					callee.type !== 'MemberExpression' ||
					callee.computed ||
					callee.object.type !== 'Identifier' ||
					callee.object.name !== '$derived' ||
					callee.property.type !== 'Identifier' ||
					callee.property.name !== 'by'
				) {
					return;
				}
				if (node.arguments.length !== 1) {
					return;
				}
				const arg = node.arguments[0];
				if (arg.type !== 'ArrowFunctionExpression' && arg.type !== 'FunctionExpression') {
					return;
				}
				if (arg.params.length !== 0 || arg.async || arg.generator) {
					return;
				}
				let expressionNode: TSESTree.Expression | null = null;
				if (arg.type === 'ArrowFunctionExpression' && arg.body.type !== 'BlockStatement') {
					expressionNode = arg.body;
				} else if (
					arg.body.type === 'BlockStatement' &&
					arg.body.body.length === 1 &&
					arg.body.body[0].type === 'ReturnStatement' &&
					arg.body.body[0].argument !== null
				) {
					expressionNode = arg.body.body[0].argument;
				}
				if (expressionNode === null) {
					return;
				}
				context.report({
					node,
					messageId: 'unnecessary',
					fix(fixer) {
						const expressionText = context.sourceCode.getText(expressionNode);
						return fixer.replaceText(node, `$derived(${expressionText})`);
					}
				});
			}
		};
	}
});
