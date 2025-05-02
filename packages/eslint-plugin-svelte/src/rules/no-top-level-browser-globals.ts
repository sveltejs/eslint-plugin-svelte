import type { TrackedReferences } from '@eslint-community/eslint-utils';
import { ReferenceTracker, getStaticValue } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import globals from 'globals';
import type { TSESTree } from '@typescript-eslint/types';
import { findVariable, getScope } from '../utils/ast-utils.js';

export default createRule('no-top-level-browser-globals', {
	meta: {
		docs: {
			description: 'disallow using top-level browser global variables',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {
			unexpectedGlobal: 'Unexpected top-level browser global variable "{{name}}".'
		},
		type: 'problem',
		conditions: []
	},
	create(context) {
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte && !sourceCode.parserServices.isSvelteScript) {
			return {};
		}
		const blowerGlobals = getBrowserGlobals();

		const functions: TSESTree.FunctionLike[] = [];

		function isTopLevelLocation(node: TSESTree.Node) {
			for (const func of functions) {
				if (func.range[0] <= node.range[0] && node.range[1] <= func.range[1]) {
					return false;
				}
			}
			return true;
		}

		function enterFunction(node: TSESTree.FunctionLike) {
			if (isTopLevelLocation(node)) {
				functions.push(node);
			}
		}

		function verifyGlobalReferences() {
			const referenceTracker = new ReferenceTracker(sourceCode.scopeManager.globalScope!, {
				// Specifies the global variables that are allowed to prevent `window.window` from being iterated over.
				globalObjectNames: ['globalThis']
			});

			type MaybeGuard = {
				reference?: { node: TSESTree.Node; name: string };
				isAvailableLocation: (node: TSESTree.Node) => boolean;
				// The guard that checks whether the browser environment is set to true.
				browserEnvironment: boolean;
				used?: boolean;
			};
			const maybeGuards: MaybeGuard[] = [];

			/**
			 * Checks whether the node is in a location where the expression is available or not.
			 * @returns `true` if the expression is available.
			 */
			function isAvailableLocation(ref: { node: TSESTree.Node; name: string }) {
				for (const guard of maybeGuards.reverse()) {
					if (guard.isAvailableLocation(ref.node)) {
						if (guard.browserEnvironment || guard.reference?.name === ref.name) {
							guard.used = true;
							return true;
						}
					}
				}
				return false;
			}

			/**
			 * Iterate over the references of modules that can check the browser environment.
			 */
			function* iterateBrowserCheckerModuleReferences(): Iterable<TSESTree.Expression> {
				for (const ref of referenceTracker.iterateEsmReferences({
					'esm-env': {
						[ReferenceTracker.ESM]: true,
						BROWSER: {
							[ReferenceTracker.READ]: true
						}
					},
					'$app/environment': {
						[ReferenceTracker.ESM]: true,
						browser: {
							[ReferenceTracker.READ]: true
						}
					}
				})) {
					if (ref.node.type === 'Identifier' || ref.node.type === 'MemberExpression') {
						yield ref.node;
					} else if (ref.node.type === 'ImportSpecifier') {
						const variable = findVariable(context, ref.node.local);
						if (variable) {
							for (const reference of variable.references) {
								if (reference.isRead() && reference.identifier.type === 'Identifier') {
									yield reference.identifier;
								}
							}
						}
					}
				}
			}

			// Collects guarded location checkers by checking module references
			// that can check the browser environment.
			for (const referenceNode of iterateBrowserCheckerModuleReferences()) {
				if (!isTopLevelLocation(referenceNode)) continue;
				const guardChecker = getGuardChecker({ node: referenceNode });
				if (guardChecker) {
					maybeGuards.push({
						isAvailableLocation: guardChecker,
						browserEnvironment: true
					});
				}
			}

			const reportCandidates: TrackedReferences<unknown>[] = [];

			// Collects references to global variables.
			for (const ref of referenceTracker.iterateGlobalReferences({
				...Object.fromEntries(
					blowerGlobals.map((name) => [
						name,
						{
							[ReferenceTracker.READ]: true
						}
					])
				)
			})) {
				if (!isTopLevelLocation(ref.node)) continue;
				const guardChecker = getGuardCheckerFromReference(ref.node);
				if (guardChecker) {
					const name = ref.path.join('.');
					maybeGuards.push({
						reference: { node: ref.node, name },
						isAvailableLocation: guardChecker,
						browserEnvironment: name === 'window' || name === 'document'
					});
				} else {
					reportCandidates.push(ref);
				}
			}

			for (const ref of reportCandidates) {
				const name = ref.path.join('.');
				if (isAvailableLocation({ node: ref.node, name })) {
					continue;
				}
				context.report({
					node: ref.node,
					messageId: 'unexpectedGlobal',
					data: { name }
				});
			}
		}

		return {
			':function': enterFunction,
			'Program:exit': verifyGlobalReferences
		};

		/**
		 * If the node is a reference used in a guard clause that checks if the node is in a browser environment,
		 * it returns information about the expression that checks if the browser variable is available.
		 * @returns The guard info.
		 */
		function getGuardCheckerFromReference(
			node: TSESTree.Node
		): ((node: TSESTree.Node) => boolean) | null {
			const parent = node.parent;
			if (!parent) return null;
			if (parent.type === 'BinaryExpression') {
				if (
					parent.operator === 'instanceof' &&
					parent.left === node &&
					node.type === 'MemberExpression'
				) {
					// e.g. if (globalThis.window instanceof X)
					return getGuardChecker({ node: parent });
				}
				const operand =
					parent.left === node ? parent.right : parent.right === node ? parent.left : null;
				if (!operand) return null;

				const staticValue = getStaticValue(operand, getScope(context, operand));
				if (!staticValue) {
					return null;
				}
				if (staticValue.value === undefined && node.type === 'MemberExpression') {
					if (parent.operator === '!==' || parent.operator === '!=') {
						// e.g. if (globalThis.window !== undefined), if (globalThis.window != undefined)
						return getGuardChecker({ node: parent });
					} else if (parent.operator === '===' || parent.operator === '==') {
						// e.g. if (globalThis.window === undefined), if (globalThis.window == undefined)
						return getGuardChecker({ node: parent, not: true });
					}
				} else if (staticValue.value === null && node.type === 'MemberExpression') {
					if (parent.operator === '!=') {
						// e.g. if (globalThis.window != null)
						return getGuardChecker({ node: parent });
					} else if (parent.operator === '==') {
						// e.g. if (globalThis.window == null)
						return getGuardChecker({ node: parent, not: true });
					}
				}
				return null;
			}
			if (
				parent.type === 'UnaryExpression' &&
				parent.operator === 'typeof' &&
				parent.argument === node
			) {
				const pp = parent.parent;
				if (!pp || pp.type !== 'BinaryExpression') {
					return null;
				}
				const staticValue = getStaticValue(
					pp.left === parent ? pp.right : pp.left,
					getScope(context, node)
				);
				if (!staticValue) {
					return null;
				}
				if (staticValue.value !== 'undefined' && staticValue.value !== 'object') {
					return null;
				}
				if (pp.operator === '!==' || pp.operator === '!=') {
					if (staticValue.value === 'undefined') {
						// e.g. if (typeof window !== "undefined"), if (typeof window != "undefined")
						return getGuardChecker({ node: pp });
					}
					// e.g. if (typeof window !== "object"), if (typeof window != "object")
					return getGuardChecker({ node: pp, not: true });
				} else if (pp.operator === '===' || pp.operator === '==') {
					if (staticValue.value === 'undefined') {
						// e.g. if (typeof window === "undefined"), if (typeof window == "undefined")
						return getGuardChecker({ node: pp, not: true });
					}
					// e.g. if (typeof window === "object"), if (typeof window == "object")
					return getGuardChecker({ node: pp });
				}
				return null;
			}

			if (node.type === 'MemberExpression') {
				// e.g. if (globalThis.window)
				return getGuardChecker({ node });
			}
			return null;
		}

		/**
		 * If the node is a guard clause checking,
		 * returns a function to check if the node is available.
		 */
		function getGuardChecker(guardInfo: {
			node: TSESTree.Expression;
			not?: boolean;
		}): ((node: TSESTree.Node) => boolean) | null {
			const parent = guardInfo.node.parent;
			if (!parent) {
				return null;
			}
			if (parent.type === 'ConditionalExpression') {
				const block = guardInfo.not ? parent.alternate : parent.consequent;
				return (n) => block.range[0] <= n.range[0] && n.range[1] <= block.range[1];
			}
			if (parent.type === 'UnaryExpression' && parent.operator === '!') {
				return getGuardChecker({ not: !guardInfo.not, node: parent });
			}
			if (parent.type === 'IfStatement' && parent.test === guardInfo.node) {
				if (!guardInfo.not) {
					const block = parent.consequent;
					return (n) => block.range[0] <= n.range[0] && n.range[1] <= block.range[1];
				}
				// e.g. if (typeof x === 'undefined')
				if (parent.alternate) {
					const block = parent.alternate;
					return (n) => block.range[0] <= n.range[0] && n.range[1] <= block.range[1];
				}
				if (!hasJumpStatementInAllPath(parent.consequent)) {
					return null;
				}
				const pp = parent.parent;
				if (!pp || (pp.type !== 'BlockStatement' && pp.type !== 'Program')) {
					return null;
				}
				const start = parent.range[1];
				const end = pp.range[1];

				return (n) => start <= n.range[0] && n.range[1] <= end;
			}
			return null;
		}
	}
});

/**
 * Get the list of browser-specific globals.
 */
function getBrowserGlobals() {
	const nodeGlobals = new Set(Object.keys(globals.node));
	return [
		'window',
		'document',
		...Object.keys(globals.browser).filter((name) => !nodeGlobals.has(name))
	];
}

/**
 * Checks whether all paths of a given statement have jump statements.
 * @param {Statement} statement
 * @returns {boolean}
 */
function hasJumpStatementInAllPath(statement: TSESTree.Statement): boolean {
	if (isJumpStatement(statement)) {
		return true;
	}
	if (statement.type === 'BlockStatement') {
		return statement.body.some(hasJumpStatementInAllPath);
	}
	if (statement.type === 'IfStatement') {
		if (!statement.alternate) {
			return false;
		}
		return (
			hasJumpStatementInAllPath(statement.alternate) &&
			hasJumpStatementInAllPath(statement.consequent)
		);
	}
	return false;
}

/**
 * Checks whether the given statement is a jump statement.
 * @param {Statement} statement
 * @returns {statement is JumpStatement}
 */
function isJumpStatement(statement: TSESTree.Statement) {
	return (
		statement.type === 'ReturnStatement' ||
		statement.type === 'ContinueStatement' ||
		statement.type === 'BreakStatement'
	);
}
