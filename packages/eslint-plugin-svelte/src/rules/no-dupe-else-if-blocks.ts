import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { equalTokens } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

type OrOperands = {
	node: TSESTree.Expression;
	operands: AndOperands[];
};
type AndOperands = {
	node: TSESTree.Expression;
	operands: TSESTree.Expression[];
};

/**
 * Splits the given node by the given logical operator.
 * @param operator Logical operator `||` or `&&`.
 * @param node The node to split.
 * @returns Array of conditions that makes the node when joined by the operator.
 */
function splitByLogicalOperator(
	operator: TSESTree.LogicalExpression['operator'],
	node: TSESTree.Expression
): TSESTree.Expression[] {
	if (node.type === 'LogicalExpression' && node.operator === operator) {
		return [
			...splitByLogicalOperator(operator, node.left),
			...splitByLogicalOperator(operator, node.right)
		];
	}
	return [node];
}

/**
 * Split with ||.
 */
function splitByOr(node: TSESTree.Expression) {
	return splitByLogicalOperator('||', node);
}

/**
 * Split with &&.
 */
function splitByAnd(node: TSESTree.Expression) {
	return splitByLogicalOperator('&&', node);
}

/**
 * Build OrOperands
 */
function buildOrOperands(node: TSESTree.Expression): OrOperands {
	const orOperands = splitByOr(node);
	return {
		node,
		operands: orOperands.map((orOperand) => {
			const andOperands = splitByAnd(orOperand);
			return {
				node: orOperand,
				operands: andOperands
			};
		})
	};
}

export default createRule('no-dupe-else-if-blocks', {
	meta: {
		docs: {
			description: 'disallow duplicate conditions in `{#if}` / `{:else if}` chains',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected:
				'This branch can never execute. Its condition is a duplicate or covered by previous conditions in the `{#if}` / `{:else if}` chain.'
		},
		type: 'problem' // "problem",
	},
	create(context) {
		const sourceCode = getSourceCode(context);

		/**
		 * Determines whether the two given nodes are considered to be equal. In particular, given that the nodes
		 * represent expressions in a boolean context, `||` and `&&` can be considered as commutative operators.
		 * @param a First node.
		 * @param b Second node.
		 * @returns `true` if the nodes are considered to be equal.
		 */
		function equal(a: TSESTree.Expression, b: TSESTree.Expression): boolean {
			if (a.type !== b.type) {
				return false;
			}

			if (
				a.type === 'LogicalExpression' &&
				b.type === 'LogicalExpression' &&
				(a.operator === '||' || a.operator === '&&') &&
				a.operator === b.operator
			) {
				return (
					(equal(a.left, b.left) && equal(a.right, b.right)) ||
					(equal(a.left, b.right) && equal(a.right, b.left))
				);
			}

			return equalTokens(a, b, sourceCode);
		}

		/**
		 * Determines whether the first given AndOperands is a subset of the second given AndOperands.
		 *
		 * e.g. A: (a && b), B: (a && b && c): B is a subset of A.
		 *
		 * @param operandsA The AndOperands to compare from.
		 * @param operandsB The AndOperands to compare against.
		 * @returns `true` if the `andOperandsA` is a subset of the `andOperandsB`.
		 */
		function isSubset(operandsA: AndOperands, operandsB: AndOperands) {
			return operandsA.operands.every((operandA) =>
				operandsB.operands.some((operandB) => equal(operandA, operandB))
			);
		}

		/** Iterate SvelteIfBlock nodes */
		function* iterateIfElseIf(node: AST.SvelteIfBlock) {
			let target = node;
			while (
				target.parent.type === 'SvelteElseBlock' &&
				(target.parent.children as AST.SvelteElseBlock['children'][number][]).includes(target) &&
				target.parent.parent.type === 'SvelteIfBlock'
			) {
				yield target.parent.parent;
				target = target.parent.parent;
			}
		}

		return {
			SvelteIfBlock(node) {
				const test = node.expression;
				const conditionsToCheck =
					test.type === 'LogicalExpression' && test.operator === '&&'
						? [...splitByAnd(test), test]
						: [test];
				const listToCheck = conditionsToCheck.map(buildOrOperands);

				for (const currentIdBlock of iterateIfElseIf(node)) {
					if (currentIdBlock.expression) {
						const currentOrOperands = buildOrOperands(currentIdBlock.expression);

						for (const condition of listToCheck) {
							const operands = (condition.operands = condition.operands.filter((orOperand) => {
								return !currentOrOperands.operands.some((currentOrOperand) =>
									isSubset(currentOrOperand, orOperand)
								);
							}));
							if (!operands.length) {
								context.report({
									node: condition.node,
									messageId: 'unexpected'
								});
								return;
							}
						}
					}
				}
			}
		};
	}
});
