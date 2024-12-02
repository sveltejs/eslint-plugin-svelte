import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type { RuleContext } from '../types.js';
import { extractStoreReferences } from './reference-helpers/svelte-store.js';

export default createRule('derived-has-same-inputs-outputs', {
	meta: {
		docs: {
			description: 'derived store should use same variable names between values and callback',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [],
		messages: {
			unexpected: "The argument name should be '{{name}}'."
		},
		type: 'suggestion'
	},
	create(context) {
		/** check node type */
		function isIdentifierOrArrayExpression(
			node: TSESTree.SpreadElement | TSESTree.Expression
		): node is TSESTree.Identifier | TSESTree.ArrayExpression {
			return ['Identifier', 'ArrayExpression'].includes(node.type);
		}

		type ArrowFunctionExpressionOrFunctionExpression =
			| TSESTree.ArrowFunctionExpression
			| TSESTree.FunctionExpression;

		/** check node type */
		function isFunctionExpression(
			node: TSESTree.SpreadElement | TSESTree.Expression
		): node is ArrowFunctionExpressionOrFunctionExpression {
			return ['ArrowFunctionExpression', 'FunctionExpression'].includes(node.type);
		}

		/**
		 * Check for identifier type.
		 * e.g. derived(a, ($a) => {});
		 */
		function checkIdentifier(
			context: RuleContext,
			args: TSESTree.Identifier,
			fn: ArrowFunctionExpressionOrFunctionExpression
		) {
			const fnParam = fn.params[0];
			if (fnParam.type !== 'Identifier') return;
			const expectedName = `$${args.name}`;
			if (expectedName !== fnParam.name) {
				context.report({
					node: fn,
					loc: fnParam.loc,
					messageId: 'unexpected',
					data: { name: expectedName }
				});
			}
		}

		/**
		 * Check for array type.
		 * e.g. derived([ a, b ], ([ $a, $b ]) => {})
		 */
		function checkArrayExpression(
			context: RuleContext,
			args: TSESTree.ArrayExpression,
			fn: ArrowFunctionExpressionOrFunctionExpression
		) {
			const fnParam = fn.params[0];
			if (fnParam.type !== 'ArrayPattern') return;
			const argNames = args.elements.map((element) => {
				return element && element.type === 'Identifier' ? element.name : null;
			});
			fnParam.elements.forEach((element, index) => {
				const argName = argNames[index];
				if (element && element.type === 'Identifier' && argName) {
					const expectedName = `$${argName}`;
					if (expectedName !== element.name) {
						context.report({
							node: fn,
							loc: element.loc,
							messageId: 'unexpected',
							data: { name: expectedName }
						});
					}
				}
			});
		}

		return {
			Program() {
				for (const { node } of extractStoreReferences(context, ['derived'])) {
					const [args, fn] = node.arguments;
					if (!args || !isIdentifierOrArrayExpression(args)) continue;
					if (!fn || !isFunctionExpression(fn)) continue;
					if (!fn.params || fn.params.length === 0) continue;
					if (args.type === 'Identifier') checkIdentifier(context, args, fn);
					else checkArrayExpression(context, args, fn);
				}
			}
		};
	}
});
