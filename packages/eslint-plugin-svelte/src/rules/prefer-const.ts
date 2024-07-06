import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils';
import type { RuleFixer, SourceCode } from '../types';

/**
 * Skip let statements when they are reactive values created by runes.
 */
function skipReactiveValues(identifier: TSESTree.Identifier) {
	let callee: TSESTree.Expression | undefined;
	if (
		identifier.parent.type === 'VariableDeclarator' &&
		identifier.parent.init?.type === 'CallExpression'
	) {
		callee = identifier.parent.init.callee;
	}
	if (
		identifier.parent.type === 'Property' &&
		identifier.parent.parent.type === 'ObjectPattern' &&
		identifier.parent.parent.parent.type === 'VariableDeclarator' &&
		identifier.parent.parent.parent.init?.type === 'CallExpression'
	) {
		callee = identifier.parent.parent.parent.init.callee;
	}
	if (callee) {
		if (callee.type === 'Identifier' && ['$state', '$props', '$derived'].includes(callee.name)) {
			return false;
		}
		if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
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
		}
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

	public retainRange(range: [number, number]) {
		this.retainedRange = range;
		return this;
	}

	public replaceTextRange(range: [number, number], text: string) {
		let actualRange: [number, number];
		if (this.retainedRange) {
			actualRange = [
				Math.min(this.retainedRange[0], range[0]),
				Math.max(this.retainedRange[1], range[1])
			];
		} else {
			actualRange = range;
		}
		return this.fixer.replaceTextRange(
			actualRange,
			this.sourceCode.text.slice(actualRange[0], range[0]) +
				text +
				this.sourceCode.text.slice(range[1], actualRange[1])
		);
	}
}
/* eslint @typescript-eslint/no-explicit-any: off -- Thoroughly tested by ESLint, but sadly they don't use TypeScript */
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
		const options = context.options[0] || {};
		const sourceCode = (context as any).sourceCode;

		const shouldMatchAnyDestructuredVariable = options.destructuring !== 'all';
		const ignoreReadBeforeAssign = options.ignoreReadBeforeAssign === true;
		const variables: any[] = [];
		let reportCount = 0;
		let checkedId: any = null;
		let checkedName = '';

		function checkGroup(nodes: any) {
			const nodesToReport = nodes.filter(Boolean);
			if (
				nodes.length &&
				(shouldMatchAnyDestructuredVariable || nodesToReport.length === nodes.length)
			) {
				const varDeclParent = findUp(nodes[0], 'VariableDeclaration', (parentNode: any) =>
					parentNode.type.endsWith('Statement')
				);
				const isVarDecParentNull = varDeclParent === null;
				if (!isVarDecParentNull && varDeclParent.declarations.length > 0) {
					const firstDeclaration = varDeclParent.declarations[0];
					if (firstDeclaration.init) {
						const firstDecParent = firstDeclaration.init.parent;
						if (firstDecParent.type === 'VariableDeclarator') {
							if (firstDecParent.id.name !== checkedName) {
								checkedName = firstDecParent.id.name;
								reportCount = 0;
							}
							if (firstDecParent.id.type === 'ObjectPattern') {
								if (firstDecParent.init.name !== checkedName) {
									checkedName = firstDecParent.init.name;
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
						varDeclParent.declarations.every((declaration: any) => declaration.init)) &&
					nodesToReport.length === nodes.length;
				if (
					!isVarDecParentNull &&
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
						varDeclParent.declarations.forEach((declaration: any) => {
							if (declaration.id.type === 'ObjectPattern') {
								totalDeclarationsCount += declaration.id.properties.length;
							} else if (declaration.id.type === 'ArrayPattern') {
								totalDeclarationsCount += declaration.id.elements.length;
							} else {
								totalDeclarationsCount += 1;
							}
						});
						shouldFix = shouldFix && reportCount === totalDeclarationsCount;
					}
				}
				nodesToReport.filter(skipReactiveValues).forEach((node: any) => {
					context.report({
						node,
						messageId: 'useConst',
						data: node,
						fix: shouldFix
							? (fixer) => {
									const letKeywordToken = sourceCode.getFirstToken(
										varDeclParent,
										(t: any) => t.value === varDeclParent.kind
									);
									return new FixTracker(fixer, sourceCode)
										.retainRange(varDeclParent.range)
										.replaceTextRange(letKeywordToken.range, 'const');
								}
							: null
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

const DECLARATION_HOST_TYPE = /^(?:Program|BlockStatement|StaticBlock|SwitchCase)$/u;
const DESTRUCTURING_HOST_TYPE = /^(?:VariableDeclarator|AssignmentExpression)$/u;

function isInitOfForStatement(node: any) {
	return node.parent.type === 'ForStatement' && node.parent.init === node;
}

function canBecomeVariableDeclaration(identifier: any) {
	let node = identifier.parent;
	while (PATTERN_TYPE.test(node.type)) {
		node = node.parent;
	}
	return (
		node.type === 'VariableDeclarator' ||
		(node.type === 'AssignmentExpression' &&
			node.parent.type === 'ExpressionStatement' &&
			DECLARATION_HOST_TYPE.test(node.parent.parent.type))
	);
}

function isOuterVariableInDestructing(name: any, initScope: any) {
	if (initScope.through.some((ref: any) => ref.resolved && ref.resolved.name === name)) {
		return true;
	}
	const variable = astUtilsGetVariableByName(initScope, name);
	if (variable !== null) {
		return variable.defs.some((def: any) => def.type === 'Parameter');
	}
	return false;
}

function getDestructuringHost(reference: any) {
	if (!reference.isWrite()) {
		return null;
	}
	let node = reference.identifier.parent;
	while (PATTERN_TYPE.test(node.type)) {
		node = node.parent;
	}
	if (!DESTRUCTURING_HOST_TYPE.test(node.type)) {
		return null;
	}
	return node;
}

function hasMemberExpressionAssignment(node: any) {
	switch (node.type) {
		case 'ObjectPattern':
			return node.properties.some((prop: any) => {
				if (prop) {
					return hasMemberExpressionAssignment(prop.argument || prop.value);
				}
				return false;
			});
		case 'ArrayPattern':
			return node.elements.some((element: any) => {
				if (element) {
					return hasMemberExpressionAssignment(element);
				}
				return false;
			});
		case 'AssignmentPattern':
			return hasMemberExpressionAssignment(node.left);
		case 'MemberExpression':
			return true;
		// no default
	}
	return false;
}

function getIdentifierIfShouldBeConst(variable: any, ignoreReadBeforeAssign: any) {
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
			if (destructuringHost !== null && destructuringHost.left !== undefined) {
				const leftNode = destructuringHost.left;
				let hasOuterVariables = false;
				let hasNonIdentifiers = false;
				if (leftNode.type === 'ObjectPattern') {
					const properties = leftNode.properties;
					hasOuterVariables = properties
						.filter((prop: any) => prop.value)
						.map((prop: any) => prop.value.name)
						.some((name: any) => isOuterVariableInDestructing(name, variable.scope));
					hasNonIdentifiers = hasMemberExpressionAssignment(leftNode);
				} else if (leftNode.type === 'ArrayPattern') {
					const elements = leftNode.elements;
					hasOuterVariables = elements
						.map((element: any) => element && element.name)
						.some((name: any) => isOuterVariableInDestructing(name, variable.scope));
					hasNonIdentifiers = hasMemberExpressionAssignment(leftNode);
				}
				if (hasOuterVariables || hasNonIdentifiers) {
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
	return writer.identifier;
}

function groupByDestructuring(variables: any, ignoreReadBeforeAssign: any) {
	const identifierMap = new Map();
	for (let i = 0; i < variables.length; ++i) {
		const variable = variables[i];
		const references = variable.references;
		const identifier = getIdentifierIfShouldBeConst(variable, ignoreReadBeforeAssign);
		let prevId = null;
		for (let j = 0; j < references.length; ++j) {
			const reference = references[j];
			const id = reference.identifier;
			if (id === prevId) {
				continue;
			}
			prevId = id;
			const group = getDestructuringHost(reference);
			if (group) {
				if (identifierMap.has(group)) {
					identifierMap.get(group).push(identifier);
				} else {
					identifierMap.set(group, [identifier]);
				}
			}
		}
	}
	return identifierMap;
}

function findUp(node: any, type: any, shouldStop: any) {
	if (!node || shouldStop(node)) {
		return null;
	}
	if (node.type === type) {
		return node;
	}
	return findUp(node.parent, type, shouldStop);
}

function astUtilsGetVariableByName(initScope: any, name: any) {
	let scope = initScope;
	while (scope) {
		const variable = scope.set.get(name);
		if (variable) {
			return variable;
		}
		scope = scope.upper;
	}
	return null;
}
