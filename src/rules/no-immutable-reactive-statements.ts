import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import type { Scope, Variable, Reference, Definition } from '@typescript-eslint/scope-manager';
import type { TSESTree } from '@typescript-eslint/types';

export default createRule('no-immutable-reactive-statements', {
	meta: {
		docs: {
			description: "disallow reactive statements that don't reference reactive values.",
			category: 'Best Practices',
			// TODO Switch to recommended in the major version.
			recommended: false
		},
		schema: [],
		messages: {
			immutable:
				'This statement is not reactive because all variables referenced in the reactive statement are immutable.'
		},
		type: 'suggestion'
	},
	create(context) {
		const scopeManager = context.getSourceCode().scopeManager;
		const globalScope = scopeManager.globalScope;
		const toplevelScope =
			globalScope?.childScopes.find((scope) => scope.type === 'module') || globalScope;
		if (!globalScope || !toplevelScope) {
			return {};
		}

		const cacheMutableVariable = new WeakMap<Variable, boolean>();

		/**
		 * Checks whether the given reference is a mutable variable or not.
		 */
		function isMutableVariableReference(reference: Reference) {
			if (reference.identifier.name.startsWith('$')) {
				// It is reactive store reference.
				return true;
			}
			if (!reference.resolved) {
				// Unknown variable
				return true;
			}
			return isMutableVariable(reference.resolved);
		}

		/**
		 * Checks whether the given variable is a mutable variable or not.
		 */
		function isMutableVariable(variable: Variable) {
			const cache = cacheMutableVariable.get(variable);
			if (cache != null) {
				return cache;
			}
			if (variable.defs.length === 0) {
				// Global variables are assumed to be immutable.
				return true;
			}
			const isMutableDefine = variable.defs.some((def) => {
				if (def.type === 'ImportBinding') {
					return false;
				}
				if (def.node.type === 'AssignmentExpression') {
					// Reactive values
					return true;
				}
				if (def.type === 'Variable') {
					const parent = def.parent;
					if (parent.kind === 'const') {
						if (
							def.node.init &&
							(def.node.init.type === 'FunctionExpression' ||
								def.node.init.type === 'ArrowFunctionExpression' ||
								def.node.init.type === 'Literal')
						) {
							return false;
						}
					} else {
						const pp = parent.parent;
						if (pp && pp.type === 'ExportNamedDeclaration' && pp.declaration === parent) {
							// Props
							return true;
						}
					}
					return hasWrite(variable);
				}
				return false;
			});
			cacheMutableVariable.set(variable, isMutableDefine);
			return isMutableDefine;
		}

		/** Checks whether the given variable has a write or reactive store reference or not. */
		function hasWrite(variable: Variable) {
			const defIds = variable.defs.map((def: Definition) => def.name);
			for (const reference of variable.references) {
				if (
					reference.isWrite() &&
					!defIds.some(
						(defId) =>
							defId.range[0] <= reference.identifier.range[0] &&
							reference.identifier.range[1] <= defId.range[1]
					)
				) {
					return true;
				}
				if (isMutableMember(reference.identifier)) {
					return true;
				}
			}
			return false;

			function isMutableMember(
				expr: TSESTree.Identifier | TSESTree.JSXIdentifier | TSESTree.MemberExpression
			): boolean {
				if (expr.type === 'JSXIdentifier') return false;
				const parent = expr.parent;
				if (parent.type === 'AssignmentExpression') {
					return parent.left === expr;
				}
				if (parent.type === 'UpdateExpression') {
					return parent.argument === expr;
				}
				if (parent.type === 'UnaryExpression') {
					return parent.operator === 'delete' && parent.argument === expr;
				}
				if (parent.type === 'MemberExpression') {
					return parent.object === expr && isMutableMember(parent);
				}
				return false;
			}
		}

		/**
		 * Iterates through references to top-level variables in the given range.
		 */
		function* iterateRangeReferences(scope: Scope, range: [number, number]) {
			for (const variable of scope.variables) {
				for (const reference of variable.references) {
					if (
						range[0] <= reference.identifier.range[0] &&
						reference.identifier.range[1] <= range[1]
					) {
						yield reference;
					}
				}
			}
		}

		return {
			SvelteReactiveStatement(node: AST.SvelteReactiveStatement) {
				for (const reference of iterateRangeReferences(toplevelScope, node.range)) {
					if (reference.isWriteOnly()) {
						continue;
					}
					if (isMutableVariableReference(reference)) {
						return;
					}
				}
				for (const through of toplevelScope.through.filter(
					(reference) =>
						node.range[0] <= reference.identifier.range[0] &&
						reference.identifier.range[1] <= node.range[1]
				)) {
					if (through.identifier.name.startsWith('$$')) {
						// Builtin `$$` vars
						return;
					}
					if (through.resolved == null) {
						// Do not report if there are missing references.
						return;
					}
				}

				context.report({
					node:
						node.body.type === 'ExpressionStatement' &&
						node.body.expression.type === 'AssignmentExpression' &&
						node.body.expression.operator === '='
							? node.body.expression.right
							: node.body,
					messageId: 'immutable'
				});
			}
		};
	}
});
