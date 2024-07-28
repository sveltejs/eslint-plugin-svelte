import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';

export default createRule('no-undefined-print', {
	meta: {
		docs: {
			description: 'Disallow from printing `undefined`',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: 'Unexpected `undefined`.'
		},
		type: 'problem'
	},
	create(context) {
		return {
			'SvelteMustacheTag[kind=text]'(node: AST.SvelteMustacheTag) {
				if (node.expression.type === 'Identifier' && node.expression.name === 'undefined') {
					context.report({
						node,
						messageId: 'unexpected'
					});
				}

				if (node.expression.type === 'LogicalExpression' && node.expression.operator === '||') {
					const left = node.expression.left;
					const right = node.expression.right;

					if (left.type === 'Identifier' && right.type === 'Literal' && right.value === undefined) {
						context.report({
							node,
							messageId: 'unexpected'
						});
					}
				}

				if (node.expression.type === 'LogicalExpression' && node.expression.operator === '??') {
					const left = node.expression.left;
					const right = node.expression.right;

					if (left.type === 'Identifier' && right.type === 'Literal' && right.value === undefined) {
						context.report({
							node,
							messageId: 'unexpected'
						});
					}
				}

				if (node.expression.type === 'ConditionalExpression') {
					const consequent = node.expression.consequent;
					const alternate = node.expression.alternate;

					if (
						(consequent.type === 'Literal' && consequent.value === undefined) ||
						(alternate.type === 'Literal' && alternate.value === undefined)
					) {
						context.report({
							node,
							messageId: 'unexpected'
						});
					}
				}
			}
		};
	}
});
