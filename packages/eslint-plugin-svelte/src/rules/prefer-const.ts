import type { Reference, Variable, Scope } from '@typescript-eslint/scope-manager';
import type { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/types';
import { createRule } from '../utils';
import type { RuleFixer, SourceCode } from '../types';
import { getSourceCode } from '../utils/compat';

type ASTNode = TSESTree.Node;

const PATTERN_TYPE =
	/^(?:.+?Pattern|RestElement|SpreadProperty|ExperimentalRestProperty|Property)$/u;
const DECLARATION_HOST_TYPE = /^(?:Program|BlockStatement|StaticBlock|SwitchCase)$/u;
const DESTRUCTURING_HOST_TYPE = /^(?:VariableDeclarator|AssignmentExpression)$/u;

type CheckedNode = NonNullable<ASTNode & { parent: NonNullable<ASTNode> }>;

function findIdentifierCallee(node: CheckedNode) {
	const { parent } = node;
	if (parent.type === 'VariableDeclarator' && parent.init?.type === 'CallExpression') {
		return parent.init.callee;
	}

	if (
		parent.type === 'Property' &&
		parent.parent.type === 'ObjectPattern' &&
		parent.parent.parent.type === 'VariableDeclarator' &&
		parent.parent.parent.init?.type === 'CallExpression'
	) {
		return parent.parent.parent.init.callee;
	}

	return null;
}

/**
 * Skip let statements when they are reactive values created by runes.
 */
function skipReactiveValues(identifier: ASTNode | null) {
	if (!identifier || !identifier.parent) {
		return false;
	}

	const callee = findIdentifierCallee(identifier);
	if (!callee) {
		return true;
	}

	if (callee.type === 'Identifier' && ['$state', '$props', '$derived'].includes(callee.name)) {
		return false;
	}

	if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') {
		return true;
	}

	if (
		callee.object.name === '$derived' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'by'
	) {
		return false;
	}
	if (
		callee.object.name === '$state' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'frozen'
	) {
		return false;
	}

	return true;
}

/**
 * Rule and helpers are copied from ESLint
 * https://github.com/eslint/eslint/blob/main/lib/rules/prefer-const.js
 */

class FixTracker {
	public fixer: RuleFixer;

	public sourceCode: SourceCode;

	public retainedRange: null | [number, number];

	public constructor(fixer: RuleFixer, sourceCode: SourceCode) {
		this.fixer = fixer;
		this.sourceCode = sourceCode;
		this.retainedRange = null;
	}

	private getRetainedRange(range: [number, number]): [number, number] {
		if (!this.retainedRange) {
			return range;
		}

		return [Math.min(this.retainedRange[0], range[0]), Math.max(this.retainedRange[1], range[1])];
	}

	public retainRange(range: [number, number]) {
		this.retainedRange = range;
		return this;
	}

	public replaceTextRange(range: [number, number], text: string) {
		const actualRange = this.getRetainedRange(range);
		const actualText =
			this.sourceCode.text.slice(actualRange[0], range[0]) +
			text +
			this.sourceCode.text.slice(range[1], actualRange[1]);

		return this.fixer.replaceTextRange(actualRange, actualText);
	}
}

export default createRule('prefer-const', {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Require `const` declarations for variables that are never reassigned after declared (excludes reactive values).',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [
			{
				type: 'object',
				properties: {
					destructuring: { enum: ['any', 'all'], default: 'any' },
					ignoreReadBeforeAssign: { type: 'boolean', default: false }
				},
				additionalProperties: false
			}
		],
		messages: {
			useConst: "'{{name}}' is never reassigned. Use 'const' instead."
		}
	},
	create(context) {
		const sourceCode = getSourceCode(context);

		const options = context.options[0] || {};
		const shouldMatchAnyDestructuredVariable = options.destructuring !== 'all';
		const ignoreReadBeforeAssign = options.ignoreReadBeforeAssign === true;

		const variables: Variable[] = [];
		let reportCount = 0;
		let checkedId: TSESTree.BindingName | null = null;
		let checkedName = '';

		function checkGroup(nodes: (ASTNode | null)[]) {
			const nodesToReport = nodes.filter(Boolean);
			if (
				nodes.length &&
				(shouldMatchAnyDestructuredVariable || nodesToReport.length === nodes.length) &&
				nodes[0] !== null
			) {
				const varDeclParent = findUp(nodes[0], 'VariableDeclaration', (parentNode: ASTNode) =>
					parentNode.type.endsWith('Statement')
				);

				const isVarDecParentNull = varDeclParent === null;
				const isValidDecParent =
					!isVarDecParentNull &&
					'declarations' in varDeclParent &&
					varDeclParent.declarations.length > 0;

				if (isValidDecParent) {
					const firstDeclaration = varDeclParent.declarations[0];

					if (firstDeclaration.init) {
						const firstDecParent = firstDeclaration.init.parent;

						if (firstDecParent.type === 'VariableDeclarator') {
							const { id } = firstDecParent;
							if ('name' in id && id.name !== checkedName) {
								checkedName = id.name;
								reportCount = 0;
							}

							if (firstDecParent.id.type === 'ObjectPattern') {
								const { init } = firstDecParent;
								if (init && 'name' in init && init.name !== checkedName) {
									checkedName = init.name;
									reportCount = 0;
								}
							}

							if (firstDecParent.id !== checkedId) {
								checkedId = firstDecParent.id;
								reportCount = 0;
							}
						}
					}
				}

				let shouldFix =
					varDeclParent &&
					(varDeclParent.parent.type === 'ForInStatement' ||
						varDeclParent.parent.type === 'ForOfStatement' ||
						('declarations' in varDeclParent &&
							varDeclParent.declarations.every((declaration) => declaration.init))) &&
					nodesToReport.length === nodes.length;

				if (
					!isVarDecParentNull &&
					'declarations' in varDeclParent &&
					varDeclParent.declarations &&
					varDeclParent.declarations.length !== 1
				) {
					if (
						varDeclParent &&
						varDeclParent.declarations &&
						varDeclParent.declarations.length >= 1
					) {
						reportCount += nodesToReport.length;
						let totalDeclarationsCount = 0;

						varDeclParent.declarations.forEach((declaration) => {
							if (declaration.id.type === 'ObjectPattern') {
								totalDeclarationsCount += declaration.id.properties.length;
								return;
							}

							if (declaration.id.type === 'ArrayPattern') {
								totalDeclarationsCount += declaration.id.elements.length;
								return;
							}

							totalDeclarationsCount += 1;
						});
						shouldFix = shouldFix && reportCount === totalDeclarationsCount;
					}
				}

				if (!shouldFix) {
					return;
				}

				nodesToReport.filter(skipReactiveValues).forEach((node) => {
					if (!node || !varDeclParent) {
						// TS check
						return;
					}

					context.report({
						node,
						messageId: 'useConst',
						// @ts-expect-error Name will exist at this point
						data: { name: node.name },
						fix: (fixer) => {
							const letKeywordToken = sourceCode.getFirstToken(varDeclParent, {
								includeComments: false,
								filter: (t) => 'kind' in varDeclParent && t.value === varDeclParent.kind
							});
							if (!letKeywordToken) {
								return null;
							}

							return new FixTracker(fixer, sourceCode)
								.retainRange(varDeclParent.range)
								.replaceTextRange(letKeywordToken.range, 'const');
						}
					});
				});
			}
		}

		return {
			'Program:exit'() {
				groupByDestructuring(variables, ignoreReadBeforeAssign).forEach(checkGroup);
			},
			VariableDeclaration(node) {
				if (node.kind === 'let' && !isInitOfForStatement(node)) {
					variables.push(...sourceCode.getDeclaredVariables(node));
				}
			}
		};
	}
});

/**
 * Checks whether a given node is located at `ForStatement.init` or not.
 */
function isInitOfForStatement(node: ASTNode): boolean {
	return Boolean(node.parent && node.parent.type === 'ForStatement' && node.parent.init === node);
}

/**
 * Checks whether a given Identifier node becomes a VariableDeclaration or not.
 */
function canBecomeVariableDeclaration(identifier: ASTNode): boolean {
	let node = identifier.parent;

	while (node && PATTERN_TYPE.test(node.type)) {
		node = node.parent;
	}
	if (!node) {
		// TS check
		return false;
	}

	const isValidAssignmentExpr =
		node.type === 'AssignmentExpression' &&
		node.parent.type === 'ExpressionStatement' &&
		DECLARATION_HOST_TYPE.test(node.parent.parent.type);
	return node.type === 'VariableDeclarator' || isValidAssignmentExpr;
}

/**
 * Checks if an property or element is from outer scope or function parameters
 * in destructing pattern.
 */
function isOuterVariableInDestructing(name: string, initScope: Scope): boolean {
	if (initScope.through.some((ref) => ref.resolved && ref.resolved.name === name)) {
		return true;
	}

	const variable = getVariableByName(initScope, name);
	return variable !== null ? variable.defs.some((def) => def.type === 'Parameter') : false;
}

/**
 * Gets the VariableDeclarator/AssignmentExpression node that a given reference
 * belongs to.
 * This is used to detect a mix of reassigned and never reassigned in a
 * destructuring.
 */
function getDestructuringHost(reference: Reference): ASTNode | null {
	if (!reference.isWrite()) {
		return null;
	}

	let node = reference.identifier.parent;
	while (PATTERN_TYPE.test(node.type)) {
		if (!node.parent) {
			return null;
		}

		node = node.parent;
	}

	return !DESTRUCTURING_HOST_TYPE.test(node.type) ? null : node;
}

/**
 * Determines if a destructuring assignment node contains
 * any MemberExpression nodes. This is used to determine if a
 * variable that is only written once using destructuring can be
 * safely converted into a const declaration.
 */
function hasMemberExpressionAssignment(node: ASTNode): boolean {
	if (node.type === 'MemberExpression') {
		return true;
	}
	if (node.type === 'ObjectPattern') {
		return node.properties.some((prop) =>
			prop ? hasMemberExpressionAssignment('argument' in prop ? prop.argument : prop.value) : false
		);
	}
	if (node.type === 'ArrayPattern') {
		return node.elements.some((element) =>
			element ? hasMemberExpressionAssignment(element) : false
		);
	}
	if (node.type === 'AssignmentPattern') {
		return hasMemberExpressionAssignment(node.left);
	}

	return false;
}

function validateObjectPattern(node: TSESTree.ObjectPattern, variable: Variable) {
	const properties = node.properties;
	const hasOuterVariables = properties
		.filter((prop) => prop.value)
		.map((prop) =>
			'value' in prop && prop.value
				? 'name' in prop.value
					? prop.value.name
					: undefined
				: undefined
		)
		.some((name) => name && isOuterVariableInDestructing(name, variable.scope));
	const hasNonIdentifiers = hasMemberExpressionAssignment(node);

	return hasOuterVariables || hasNonIdentifiers;
}

function validateArrayPattern(node: TSESTree.ArrayPattern, variable: Variable) {
	const elements = node.elements;
	const hasOuterVariables = elements
		.map((element) => (element && 'name' in element ? element.name : undefined))
		.some((name) => name && isOuterVariableInDestructing(name, variable.scope));
	const hasNonIdentifiers = hasMemberExpressionAssignment(node);

	return hasOuterVariables || hasNonIdentifiers;
}

/**
 * Gets an identifier node of a given variable.
 *
 * If the initialization exists or one or more reading references exist before
 * the first assignment, the identifier node is the node of the declaration.
 * Otherwise, the identifier node is the node of the first assignment.
 *
 * If the variable should not change to const, this function returns null.
 * - If the variable is reassigned.
 * - If the variable is never initialized nor assigned.
 * - If the variable is initialized in a different scope from the declaration.
 * - If the unique assignment of the variable cannot change to a declaration.
 *   e.g. `if (a) b = 1` / `return (b = 1)`
 * - If the variable is declared in the global scope and `eslintUsed` is `true`.
 *   `/*exported foo` directive comment makes such variables. This rule does not
 *   warn such variables because this rule cannot distinguish whether the
 *   exported variables are reassigned or not.
 */
function getIdentifierIfShouldBeConst(variable: Variable, ignoreReadBeforeAssign: boolean) {
	if (variable.eslintUsed && variable.scope.type === 'global') {
		return null;
	}
	let writer = null;
	let isReadBeforeInit = false;
	const references = variable.references;
	for (let i = 0; i < references.length; ++i) {
		const reference = references[i];

		if (reference.isWrite()) {
			const isReassigned = writer !== null && writer.identifier !== reference.identifier;
			if (isReassigned) {
				return null;
			}

			const destructuringHost = getDestructuringHost(reference);
			const isValidDestructuringHost =
				destructuringHost !== null &&
				'left' in destructuringHost &&
				destructuringHost.left !== undefined;

			if (isValidDestructuringHost) {
				const leftNode = destructuringHost.left;

				if (leftNode.type === 'ObjectPattern' && validateObjectPattern(leftNode, variable)) {
					return null;
				} else if (leftNode.type === 'ArrayPattern' && validateArrayPattern(leftNode, variable)) {
					return null;
				}
			}

			writer = reference;
		} else if (reference.isRead() && writer === null) {
			if (ignoreReadBeforeAssign) {
				return null;
			}
			isReadBeforeInit = true;
		}
	}

	const shouldBeConst =
		writer !== null &&
		writer.from === variable.scope &&
		canBecomeVariableDeclaration(writer.identifier);
	if (!shouldBeConst) {
		return null;
	}
	if (isReadBeforeInit) {
		return variable.defs[0].name;
	}

	return writer?.identifier;
}

/**
 * Groups by the VariableDeclarator/AssignmentExpression node that each
 * reference of given variables belongs to.
 * This is used to detect a mix of reassigned and never reassigned in a
 * destructuring.
 */
function groupByDestructuring(
	variables: Variable[],
	ignoreReadBeforeAssign: boolean
): Map<ASTNode, ASTNode[]> {
	const identifierMap = new Map<ASTNode, ASTNode[]>();

	for (let i = 0; i < variables.length; ++i) {
		const variable = variables[i];
		const references = variable.references;
		const identifier = getIdentifierIfShouldBeConst(variable, ignoreReadBeforeAssign);
		if (!identifier) {
			return identifierMap;
		}

		let prevId: TSESTree.Identifier | TSESTree.JSXIdentifier | null = null;
		references.forEach((reference) => {
			const id = reference.identifier;
			if (id === prevId) {
				return;
			}

			prevId = id;
			const group = getDestructuringHost(reference);
			if (!group) {
				return;
			}

			if (identifierMap.has(group)) {
				identifierMap.get(group)!.push(identifier);
			} else {
				identifierMap.set(group, [identifier]);
			}
		});
	}

	return identifierMap;
}

/**
 * Finds the nearest parent of node with a given type.
 */
function findUp(node: ASTNode, type: `${AST_NODE_TYPES}`, shouldStop: (node: ASTNode) => boolean) {
	if (!node || shouldStop(node) || !node.parent) {
		return null;
	}
	if (node.type === type) {
		return node;
	}

	return findUp(node.parent, type, shouldStop);
}

/**
 * Finds the variable by a given name in a given scope and its upper scopes.
 */
function getVariableByName(initScope: Scope, name: string): Variable | null {
	let scope: Scope | null = initScope;

	while (scope) {
		const variable = scope.set.get(name);
		if (variable) {
			return variable;
		}
		scope = scope.upper;
	}

	return null;
}
