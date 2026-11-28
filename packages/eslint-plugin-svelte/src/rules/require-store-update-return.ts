import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import type { Rule } from 'eslint';
import type { AST } from 'svelte-eslint-parser';
import { getFunctionHeadLocation, getPropertyName } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import { findVariable, getParent } from '../utils/ast-utils.js';
import { createStoreChecker, extractStoreReferences } from './reference-helpers/svelte-store.js';

type FunctionInfo = {
	upper: FunctionInfo | null;
	/** Whether the function is an updater passed to a store's `update`. */
	isUpdater: boolean;
	currentSegments: Set<Rule.CodePathSegment>;
};

export default createRule('require-store-update-return', {
	meta: {
		docs: {
			description: 'require store `update` callbacks to return a value',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {
			missingReturn:
				'Expected the store `update` callback to return a value. Otherwise, the store is set to `undefined`.',
			missingReturnValue: 'Expected the store `update` callback to return a value.'
		},
		type: 'problem'
	},
	create(context) {
		const sourceCode = context.sourceCode;
		const isStore = createStoreChecker(context);
		/** Variables of the `update` function destructured from `writable()` */
		const updateVariables = new Set<Variable>();
		let functionInfo: FunctionInfo | null = null;

		/**
		 * Checks whether the given expression is the `update` function of a store.
		 */
		function isUpdateFunction(callee: TSESTree.Expression): boolean {
			if (callee.type === 'Identifier') {
				if (callee.name.startsWith('$')) {
					return false;
				}
				const variable = findVariable(context, callee);
				return variable != null && updateVariables.has(variable);
			}
			return (
				callee.type === 'MemberExpression' &&
				getPropertyName(callee) === 'update' &&
				callee.object.type !== 'Super' &&
				isStore(callee.object)
			);
		}

		/**
		 * Checks whether the given function is passed to a store's `update` as the updater.
		 */
		function isUpdater(node: TSESTree.Node): boolean {
			if (
				(node.type !== 'ArrowFunctionExpression' && node.type !== 'FunctionExpression') ||
				node.async ||
				node.generator
			) {
				return false;
			}
			const parent = getParent(node);
			return (
				parent?.type === 'CallExpression' &&
				parent.arguments[0] === node &&
				isUpdateFunction(parent.callee)
			);
		}

		/**
		 * Reports the given updater if the end of its body is reachable.
		 */
		function checkLastSegment(
			node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression
		) {
			if (
				!functionInfo?.isUpdater ||
				node.body.type !== 'BlockStatement' ||
				![...functionInfo.currentSegments].some((segment) => segment.reachable)
			) {
				return;
			}
			context.report({
				node,
				loc: getFunctionHeadLocation(node, sourceCode as never),
				messageId: 'missingReturn'
			});
		}

		return {
			Program() {
				for (const { node } of extractStoreReferences(context, ['writable'])) {
					const parent = getParent(node);
					if (parent?.type !== 'VariableDeclarator' || parent.id.type !== 'ObjectPattern') {
						continue;
					}
					for (const property of parent.id.properties) {
						if (
							property.type === 'Property' &&
							property.value.type === 'Identifier' &&
							getPropertyName(property) === 'update'
						) {
							const variable = findVariable(context, property.value);
							if (variable) {
								updateVariables.add(variable);
							}
						}
					}
				}
			},
			onCodePathStart(_codePath: Rule.CodePath, node: TSESTree.Node | AST.SvelteNode) {
				functionInfo = {
					upper: functionInfo,
					isUpdater: isUpdater(node as TSESTree.Node),
					currentSegments: new Set()
				};
			},
			onCodePathEnd() {
				functionInfo = functionInfo?.upper ?? null;
			},
			onCodePathSegmentStart(segment: Rule.CodePathSegment) {
				functionInfo?.currentSegments.add(segment);
			},
			onCodePathSegmentEnd(segment: Rule.CodePathSegment) {
				functionInfo?.currentSegments.delete(segment);
			},
			onUnreachableCodePathSegmentStart(segment: Rule.CodePathSegment) {
				functionInfo?.currentSegments.add(segment);
			},
			onUnreachableCodePathSegmentEnd(segment: Rule.CodePathSegment) {
				functionInfo?.currentSegments.delete(segment);
			},
			ReturnStatement(node: TSESTree.ReturnStatement) {
				if (functionInfo?.isUpdater && !node.argument) {
					context.report({
						node,
						messageId: 'missingReturnValue'
					});
				}
			},
			'ArrowFunctionExpression:exit': checkLastSegment,
			'FunctionExpression:exit': checkLastSegment
		};
	}
});
