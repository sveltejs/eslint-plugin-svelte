import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getScope } from '../utils/ast-utils.js';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
import semver from 'semver';

// Writable derived were introduced in Svelte 5.25.0
const shouldRun = semver.satisfies(SVELTE_VERSION, '>=5.25.0');

type ValidFunctionType = TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression;
type ValidFunction = ValidFunctionType & {
	body: TSESTree.BlockStatement;
};

type ValidAssignmentExpression = TSESTree.AssignmentExpression & {
	operator: '=';
	left: TSESTree.Identifier;
};

type ValidExpressionStatement = TSESTree.ExpressionStatement & {
	expression: ValidAssignmentExpression;
};

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

function isValidFunctionArgument(argument: TSESTree.Node): argument is ValidFunction {
	if (
		(argument.type !== 'FunctionExpression' && argument.type !== 'ArrowFunctionExpression') ||
		argument.params.length !== 0
	) {
		return false;
	}

	if (argument.body.type !== 'BlockStatement') {
		return false;
	}

	return argument.body.body.length === 1;
}

function isValidAssignment(statement: TSESTree.Statement): statement is ValidExpressionStatement {
	if (statement.type !== 'ExpressionStatement') return false;

	const { expression } = statement;
	return (
		expression.type === 'AssignmentExpression' &&
		expression.operator === '=' &&
		expression.left.type === 'Identifier'
	);
}

function isStateVariable(init: TSESTree.Expression | null): init is TSESTree.CallExpression {
	return (
		init?.type === 'CallExpression' &&
		init.callee.type === 'Identifier' &&
		init.callee.name === '$state'
	);
}

const MUTATING_METHODS = new Set([
	// Array
	'copyWithin',
	'fill',
	'pop',
	'push',
	'reverse',
	'shift',
	'sort',
	'splice',
	'unshift',
	// Map / Set
	'add',
	'clear',
	'delete',
	'set'
]);

/**
 * Checks whether the variable is mutated through one of its properties,
 * e.g. `v.a = 1`, `v.a++`, `delete v.a`, `bind:value={v.a}` or `v.push(1)`.
 * `$state` makes objects deeply reactive but `$derived` does not,
 * so such a variable can't be rewritten to `$derived`.
 */
function isDeeplyMutated(variable: Variable): boolean {
	return variable.references.some((reference) => {
		let node: TSESTree.Node = reference.identifier as TSESTree.Node;
		let property: string | null = null;
		while (node.parent?.type === 'MemberExpression' && node.parent.object === node) {
			node = node.parent;
			property = !node.computed && node.property.type === 'Identifier' ? node.property.name : null;
		}
		if (node === reference.identifier) return false;

		const parent = node.parent as TSESTree.Node | AST.SvelteDirective | undefined;
		if (!parent) return false;
		switch (parent.type) {
			case 'AssignmentExpression':
				return parent.left === node;
			case 'UpdateExpression':
				return true;
			case 'UnaryExpression':
				return parent.operator === 'delete';
			case 'CallExpression':
				return parent.callee === node && property != null && MUTATING_METHODS.has(property);
			case 'SvelteDirective':
				return parent.kind === 'Binding';
			default:
				return false;
		}
	});
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
			unexpected: 'Prefer using writable $derived instead of $state and $effect',
			suggestRewrite: 'Rewrite $state and $effect to $derived'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				runes: [true, 'undetermined']
			}
		],
		hasSuggestions: true
	},
	create(context) {
		if (!shouldRun) {
			return {};
		}
		return {
			CallExpression: (node: TSESTree.CallExpression) => {
				if (!isEffectOrEffectPre(node) || node.arguments.length !== 1) {
					return;
				}

				const argument = node.arguments[0];
				if (!isValidFunctionArgument(argument)) {
					return;
				}

				const statement = argument.body.body[0];
				if (!isValidAssignment(statement)) {
					return;
				}

				const { left, right } = statement.expression;
				const scope = getScope(context, statement);
				const reference = scope.references.find(
					(ref) => ref.identifier.type === 'Identifier' && ref.identifier.name === left.name
				);

				const def = reference?.resolved?.defs?.[0];
				if (!def || def.type !== 'Variable' || def.node.type !== 'VariableDeclarator') {
					return;
				}

				const { init } = def.node;
				if (!isStateVariable(init)) {
					return;
				}

				if (isDeeplyMutated(reference.resolved!)) {
					return;
				}

				context.report({
					node: def.node,
					messageId: 'unexpected',
					suggest: [
						{
							messageId: 'suggestRewrite',
							fix: (fixer) => {
								const rightCode = context.sourceCode.getText(right);
								return [fixer.replaceText(init, `$derived(${rightCode})`), fixer.remove(node)];
							}
						}
					]
				});
			}
		};
	}
});
