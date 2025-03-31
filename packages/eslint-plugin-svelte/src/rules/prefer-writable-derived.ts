import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { getScope } from 'src/utils/ast-utils.js';
import { getSourceCode } from 'src/utils/compat.js';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
import semver from 'semver';

// Writable derived were introduced in Svelte 5.25.0
const shouldRun = semver.satisfies(SVELTE_VERSION, '>=5.25.0');

function isEffectOrEffectPre(node: TSESTree.CallExpression) {
	if (node.callee.type === 'Identifier') {
		return node.callee.name === '$effect';
	}
	if (node.callee.type === 'MemberExpression') {
		return (
			node.callee.object.type === 'Identifier' &&
			node.callee.object.name === '$effect' &&
			node.callee.property.type === 'Identifier' &&
			node.callee.property.name === 'pre'
		);
	}

	return false;
}

export default createRule('prefer-writable-derived', {
	meta: {
		docs: {
			description: 'Prefer using writable $derived instead of $state and $effect',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			unexpected: 'Prefer using writable $derived instead of $state and $effect'
		},
		type: 'suggestion',
		conditions: [],
		fixable: 'code'
	},
	create(context) {
		if (!shouldRun) {
			return {};
		}
		return {
			CallExpression: (node: TSESTree.CallExpression) => {
				if (!isEffectOrEffectPre(node)) {
					return;
				}

				if (node.arguments.length !== 1) {
					return;
				}

				const argument = node.arguments[0];
				if (argument.type !== 'FunctionExpression' && argument.type !== 'ArrowFunctionExpression') {
					return;
				}

				if (argument.params.length !== 0) {
					return;
				}

				if (argument.body.type !== 'BlockStatement') {
					return;
				}

				const body = argument.body.body;
				if (body.length !== 1) {
					return;
				}

				const statement = body[0];
				if (statement.type !== 'ExpressionStatement') {
					return;
				}

				const expression = statement.expression;
				if (expression.type !== 'AssignmentExpression') {
					return;
				}

				const { left, right, operator } = expression;
				if (operator !== '=' || left.type !== 'Identifier') {
					return;
				}

				const scope = getScope(context, statement);
				const reference = scope.references.find((reference) => {
					return (
						reference.identifier.type === 'Identifier' && reference.identifier.name === left.name
					);
				});
				const defs = reference?.resolved?.defs;
				if (defs == null || defs.length !== 1) {
					return;
				}

				const def = defs[0];
				if (def.type !== 'Variable' || def.node.type !== 'VariableDeclarator') {
					return;
				}

				const init = def.node.init;
				if (init == null || init.type !== 'CallExpression') {
					return;
				}

				if (init.callee.type !== 'Identifier' || init.callee.name !== '$state') {
					return;
				}

				context.report({
					node: def.node,
					messageId: 'unexpected',
					fix: (fixer) => {
						const rightCode = getSourceCode(context).getText(right);
						return [fixer.replaceText(init, `$derived(${rightCode})`), fixer.remove(node)];
					}
				});
			}
		};
	}
});
