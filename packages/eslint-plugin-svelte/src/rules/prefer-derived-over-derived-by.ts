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
						const { sourceCode } = context;
						const typeArguments =
							node.typeArguments ??
							// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
							((node as any).typeParameters as TSESTree.TSTypeParameterInstantiation | undefined);
						const returnType = arg.returnType?.typeAnnotation;
						if (
							// `$derived()` has no place for a type parameter of the function itself,
							// and only one of the two type annotations can be kept.
							arg.typeParameters ||
							(typeArguments && returnType) ||
							// Comments outside the expression would be lost.
							sourceCode.getCommentsInside(node).length !==
								sourceCode.getCommentsInside(expressionNode).length
						) {
							return null;
						}

						const typeText = typeArguments
							? sourceCode.getText(typeArguments)
							: returnType
								? `<${sourceCode.getText(returnType)}>`
								: '';
						const expressionText = sourceCode.getText(expressionNode);
						return fixer.replaceText(
							node,
							`$derived${typeText}(${
								// A sequence expression would otherwise become multiple arguments.
								expressionNode.type === 'SequenceExpression'
									? `(${expressionText})`
									: expressionText
							})`
						);
					}
				});
			}
		};
	}
});
