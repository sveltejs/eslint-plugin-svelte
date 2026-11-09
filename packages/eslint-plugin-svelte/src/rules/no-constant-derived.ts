import type { TSESTree } from '@typescript-eslint/types';
import type { Variable } from '@typescript-eslint/scope-manager';
import { createRule } from '../utils/index.js';
import { findVariable } from '../utils/ast-utils.js';

/** Globals that always hold the same primitive value. */
const CONSTANT_GLOBALS = new Set(['undefined', 'NaN', 'Infinity']);

export default createRule('no-constant-derived', {
	meta: {
		docs: {
			description: 'disallow `$derived()` with an argument that never changes',
			category: 'Best Practices',
			recommended: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			constant:
				'This `$derived()` does not read any reactive values, so it never updates. Use `$state()` instead, or no rune at all if the value is never reassigned.',
			function:
				'This `$derived()` holds the function itself, which never updates. Use `$derived.by()` to derive the value the function returns.',
			useDerivedBy: 'Use `$derived.by()` instead.'
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
		const constantVariables = new Map<Variable, boolean>();

		/**
		 * Checks whether the given expression evaluates without reading any reactive value.
		 * Anything that may run user code or read a property, such as calls, `new`,
		 * member access, spread and `in`, is treated as possibly reactive.
		 */
		function isConstant(node: TSESTree.Node): boolean {
			switch (node.type) {
				case 'Literal':
				case 'ArrowFunctionExpression':
				case 'FunctionExpression':
					return true;
				case 'Identifier':
					return isConstantIdentifier(node);
				case 'TemplateLiteral':
					return node.expressions.every(isConstant);
				case 'ArrayExpression':
					return node.elements.every((element) => element === null || isConstant(element));
				case 'ObjectExpression':
					return node.properties.every(
						(property) =>
							property.type === 'Property' &&
							(!property.computed || isConstant(property.key)) &&
							isConstant(property.value)
					);
				case 'UnaryExpression':
					return isConstant(node.argument);
				case 'BinaryExpression':
					// `in` reads the right operand, which may be a reactive object.
					return node.operator !== 'in' && isConstant(node.left) && isConstant(node.right);
				case 'LogicalExpression':
					return isConstant(node.left) && isConstant(node.right);
				case 'ConditionalExpression':
					return isConstant(node.test) && isConstant(node.consequent) && isConstant(node.alternate);
				case 'SequenceExpression':
					return node.expressions.every(isConstant);
				case 'TSAsExpression':
				case 'TSSatisfiesExpression':
				case 'TSNonNullExpression':
				case 'TSTypeAssertion':
					return isConstant(node.expression);
				default:
					return false;
			}
		}

		/** Checks whether the given identifier always refers to the same value. */
		function isConstantIdentifier(node: TSESTree.Identifier): boolean {
			if (node.name.startsWith('$')) {
				// Store subscriptions and runes.
				return false;
			}
			const variable = findVariable(context, node);
			if (!variable || variable.defs.length === 0) {
				return CONSTANT_GLOBALS.has(node.name);
			}
			return isConstantVariable(variable);
		}

		/**
		 * Checks whether the given variable is an import, or a `const` whose initializer is constant.
		 * Destructured `$props()` and `$state()` objects are not constant because their initializers are calls.
		 */
		function isConstantVariable(variable: Variable): boolean {
			const cached = constantVariables.get(variable);
			if (cached != null) {
				return cached;
			}
			// Assume the variable is not constant while checking it, in case it refers to itself.
			constantVariables.set(variable, false);
			const result = variable.defs.every((def) => {
				if (def.type === 'ImportBinding') {
					return true;
				}
				return (
					def.type === 'Variable' &&
					def.parent.kind === 'const' &&
					def.node.init != null &&
					isConstant(def.node.init)
				);
			});
			constantVariables.set(variable, result);
			return result;
		}

		return {
			CallExpression(node: TSESTree.CallExpression) {
				if (
					node.callee.type !== 'Identifier' ||
					node.callee.name !== '$derived' ||
					node.arguments.length !== 1
				) {
					return;
				}
				const argument = node.arguments[0];
				if (argument.type === 'SpreadElement' || !isConstant(argument)) {
					return;
				}
				if (argument.type !== 'ArrowFunctionExpression' && argument.type !== 'FunctionExpression') {
					context.report({ node: argument, messageId: 'constant' });
					return;
				}
				const typeArguments =
					node.typeArguments ??
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Support old typescript-eslint
					((node as any).typeParameters as TSESTree.TSTypeParameterInstantiation | undefined);
				context.report({
					node: argument,
					messageId: 'function',
					suggest:
						// `$derived.by()` calls the function without arguments or `this`,
						// and the type arguments of `$derived()` describe the function, not its return value.
						argument.type === 'ArrowFunctionExpression' &&
						argument.params.length === 0 &&
						!argument.async &&
						!typeArguments
							? [
									{
										messageId: 'useDerivedBy',
										fix: (fixer) => fixer.insertTextAfter(node.callee, '.by')
									}
								]
							: []
				});
			}
		};
	}
});
