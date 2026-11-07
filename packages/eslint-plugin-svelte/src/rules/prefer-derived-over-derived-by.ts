import type { TSESTree } from '@typescript-eslint/types';
import {
	isArrowToken,
	isClosingParenToken,
	isOpeningParenToken
} from '@eslint-community/eslint-utils';
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
		const { sourceCode } = context;

		/** Get the range of the node including its enclosing parentheses. */
		function getParenthesizedRange(target: TSESTree.Node): [number, number] {
			let range = target.range;
			for (;;) {
				const before = sourceCode.getTokenBefore({ range } as TSESTree.Node);
				const after = sourceCode.getTokenAfter({ range } as TSESTree.Node);
				if (
					!before ||
					!after ||
					!isOpeningParenToken(before) ||
					!isClosingParenToken(after) ||
					before.range[0] < target.parent!.range[0]
				) {
					return range;
				}
				range = [before.range[0], after.range[1]];
			}
		}

		/** Check whether the node uses `this` or `new.target` of the enclosing function. */
		function usesThisOrNewTarget(target: TSESTree.Node): boolean {
			if (
				target.type === 'ThisExpression' ||
				(target.type === 'MetaProperty' && target.meta.name === 'new')
			) {
				return true;
			}
			if (target.type === 'FunctionExpression' || target.type === 'FunctionDeclaration') {
				// These functions have their own `this` and `new.target`.
				return false;
			}
			return (sourceCode.visitorKeys[target.type] ?? []).some((key) => {
				const value = (target as unknown as Record<string, unknown>)[key];
				return (Array.isArray(value) ? value : [value]).some(
					(child) =>
						child &&
						typeof (child as TSESTree.Node).type === 'string' &&
						usesThisOrNewTarget(child as TSESTree.Node)
				);
			});
		}

		/**
		 * Check whether the function uses a binding that `$derived()` would change:
		 * `this`, `arguments`, `new.target`, or its own name.
		 */
		function usesOwnBindings(fn: TSESTree.FunctionExpression): boolean {
			if (sourceCode.scopeManager.acquire(fn as never)?.set.get('arguments')?.references.length) {
				return true;
			}
			if (
				fn.id &&
				sourceCode
					.getDeclaredVariables(fn as never)
					.some((variable) => variable.name === fn.id!.name && variable.references.length > 0)
			) {
				return true;
			}
			return usesThisOrNewTarget(fn.body);
		}

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
						const typeArguments =
							node.typeArguments ??
							// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
							((node as any).typeParameters as TSESTree.TSTypeParameterInstantiation | undefined);
						const returnType = arg.returnType?.typeAnnotation;
						if (
							// `$derived()` has no place for a type parameter of the function itself.
							arg.typeParameters ||
							// A type predicate is only allowed as a return type.
							returnType?.type === 'TSTypePredicate' ||
							// Only one of the two type annotations can be kept.
							(typeArguments &&
								returnType &&
								sourceCode.getText(typeArguments) !== `<${sourceCode.getText(returnType)}>`) ||
							(arg.type === 'FunctionExpression' && usesOwnBindings(arg))
						) {
							return null;
						}

						// The fix removes the code around the expression and keeps everything else in place.
						const tokenBeforeExpression =
							arg.body.type === 'BlockStatement'
								? sourceCode.getFirstToken(expressionNode.parent)
								: sourceCode.getTokenBefore(arg.body, {
										filter: isArrowToken,
										includeComments: false
									})!;
						const keptStart = sourceCode.getTokenAfter(tokenBeforeExpression, {
							includeComments: true
						})!.range[0];
						const keptEnd =
							arg.body.type === 'BlockStatement'
								? getParenthesizedRange(expressionNode)[1]
								: arg.range[1];
						const typeText =
							!typeArguments && returnType ? `<${sourceCode.getText(returnType)}>` : '';
						const removedRanges: [number, number][] = [
							[callee.object.range[1], callee.range[1]],
							[arg.range[0], keptStart],
							[keptEnd, arg.range[1]]
						];
						const keptTypeRange = typeText ? returnType!.range : null;
						if (
							sourceCode
								.getCommentsInside(node)
								.some(
									(comment) =>
										!(
											keptTypeRange &&
											keptTypeRange[0] <= comment.range[0] &&
											comment.range[1] <= keptTypeRange[1]
										) &&
										removedRanges.some(
											([start, end]) => start <= comment.range[0] && comment.range[1] <= end
										)
								)
						) {
							// The comment would be lost.
							return null;
						}

						// A sequence expression would otherwise become multiple arguments.
						const needsParens =
							expressionNode.type === 'SequenceExpression' &&
							getParenthesizedRange(expressionNode)[0] === expressionNode.range[0];
						return [
							fixer.replaceTextRange(removedRanges[0], typeText),
							fixer.replaceTextRange(removedRanges[1], needsParens ? '(' : ''),
							fixer.replaceTextRange(removedRanges[2], needsParens ? ')' : '')
						];
					}
				});
			}
		};
	}
});
