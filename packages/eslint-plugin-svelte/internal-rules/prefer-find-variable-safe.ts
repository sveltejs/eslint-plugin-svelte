import type { Rule } from 'eslint';
import { ReferenceTracker, findVariable } from '@eslint-community/eslint-utils';
import path from 'node:path';
import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';

export default {
	meta: {
		docs: {
			description: 'enforce to use FindVariableContext to avoid infinite recursion',
			category: 'Best Practices',
			recommended: false,
			conflictWithPrettier: false,
			url: 'https://github.com/sveltejs/eslint-plugin-svelte/blob/v3.12.3/docs/rules/prefer-find-variable-safe.md'
		},
		messages: {
			preferFindVariableSafe: 'Prefer to use FindVariableContext to avoid infinite recursion.'
		},
		schema: [],
		type: 'suggestion'
	},
	create(context: Rule.RuleContext): Rule.RuleListener {
		const referenceTracker = new ReferenceTracker(
			context.sourceCode.scopeManager.globalScope as never
		);
		let astUtilsPath = path.relative(
			path.dirname(context.physicalFilename),
			path.join(import.meta.dirname, '..', 'src', 'utils', 'ast-utils')
		);
		if (!astUtilsPath.startsWith('.')) {
			astUtilsPath = `./${astUtilsPath}`;
		}
		const findVariableCalls = [
			...referenceTracker.iterateEsmReferences({
				[astUtilsPath]: {
					[ReferenceTracker.ESM]: true,
					findVariable: {
						[ReferenceTracker.CALL]: true
					}
				},
				[`${astUtilsPath}.js`]: {
					[ReferenceTracker.ESM]: true,
					findVariable: {
						[ReferenceTracker.CALL]: true
					}
				},
				[`${astUtilsPath}.ts`]: {
					[ReferenceTracker.ESM]: true,
					findVariable: {
						[ReferenceTracker.CALL]: true
					}
				}
			})
		];
		type FunctionContext = {
			node:
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| TSESTree.ArrowFunctionExpression;
			identifier: TSESTree.Identifier | null;
			findVariableCall?: TSESTree.CallExpression;
			calls: Set<TSESTree.Identifier>;
			upper: FunctionContext | null;
		};
		let functionStack: FunctionContext | null = null;
		const functionContexts: FunctionContext[] = [];

		function getFunctionVariableName(
			node:
				| TSESTree.FunctionDeclaration
				| TSESTree.FunctionExpression
				| TSESTree.ArrowFunctionExpression
		) {
			if (node.type === 'FunctionDeclaration') {
				return node.id;
			}
			if (node.parent?.type === 'VariableDeclarator' && node.parent.id.type === 'Identifier') {
				return node.parent.id;
			}
			return null;
		}

		function* iterateVariables(node: TSESTree.Identifier) {
			const visitedNodes = new Set<TSESTree.Identifier>();
			let currentNode: TSESTree.Identifier | null = node;
			while (currentNode) {
				if (visitedNodes.has(currentNode)) break;
				const variable = findVariable(
					context.sourceCode.getScope(currentNode),
					currentNode
				) as Variable | null;
				if (!variable) break;
				yield variable;
				const def = variable.defs[0];
				if (!def) break;
				if (def.type !== 'Variable' || !def.node.init) break;
				if (def.node.init.type !== 'Identifier') break;
				currentNode = def.node.init;
				visitedNodes.add(currentNode);
			}
		}

		/**
		 * Verify a function context to report if necessary.
		 * Reports when a function contains a call to findVariable and the function is recursive.
		 */
		function verifyFunctionContext(functionContext: FunctionContext) {
			if (!functionContext.findVariableCall) return;
			if (!hasRecursive(functionContext)) return;
			context.report({
				node: functionContext.findVariableCall,
				messageId: 'preferFindVariableSafe'
			});
		}

		function hasRecursive(functionContext: FunctionContext) {
			const buffer = [functionContext];
			const visitedContext = new Set<FunctionContext>();
			let current;
			while ((current = buffer.shift())) {
				if (visitedContext.has(current)) continue;
				visitedContext.add(current);
				if (!current.identifier) continue;
				for (const variable of iterateVariables(current.identifier)) {
					for (const { identifier } of variable.references) {
						if (identifier.type !== 'Identifier') continue;
						if (functionContext.calls.has(identifier)) {
							return true;
						}
						buffer.push(...functionContexts.filter((ctx) => ctx.calls.has(identifier)));
					}
				}
			}
			return false;
		}

		return {
			':function'(
				node:
					| TSESTree.FunctionDeclaration
					| TSESTree.FunctionExpression
					| TSESTree.ArrowFunctionExpression
			) {
				functionStack = {
					node,
					identifier: getFunctionVariableName(node),
					calls: new Set(),
					upper: functionStack
				};
				functionContexts.push(functionStack);
			},
			':function:exit'() {
				functionStack = functionStack?.upper || null;
			},
			CallExpression(node) {
				if (!functionStack) return;
				if (findVariableCalls.some((call) => call.node === node)) {
					functionStack.findVariableCall = node;
				}
				if (node.callee.type === 'Identifier') {
					functionStack.calls.add(node.callee);
				}
			},
			'Program:exit'() {
				for (const functionContext of functionContexts) {
					verifyFunctionContext(functionContext);
				}
			}
		};
	}
};
