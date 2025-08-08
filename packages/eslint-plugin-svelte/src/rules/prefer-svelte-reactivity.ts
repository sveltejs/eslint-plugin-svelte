import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';
import { findVariable, isIn } from '../utils/ast-utils.js';
import { getSvelteContext } from '../utils/svelte-context.js';

type FunctionLike =
	| TSESTree.ArrowFunctionExpression
	| TSESTree.FunctionDeclaration
	| TSESTree.MethodDefinition;

type VariableLike = TSESTree.VariableDeclarator | TSESTree.PropertyDefinition;

export default createRule('prefer-svelte-reactivity', {
	meta: {
		docs: {
			description:
				'disallow using mutable instances of built-in classes where a reactive alternative is provided by svelte/reactivity',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreEncapsulatedLocalVariables: {
						type: 'boolean',
						default: true
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			mutableDateUsed:
				'Found a mutable instance of the built-in Date class. Use SvelteDate instead.',
			mutableMapUsed: 'Found a mutable instance of the built-in Map class. Use SvelteMap instead.',
			mutableSetUsed: 'Found a mutable instance of the built-in Set class. Use SvelteSet instead.',
			mutableURLUsed: 'Found a mutable instance of the built-in URL class. Use SvelteURL instead.',
			mutableURLSearchParamsUsed:
				'Found a mutable instance of the built-in URLSearchParams class. Use SvelteURLSearchParams instead.'
		},
		type: 'problem',
		conditions: [
			{
				svelteVersions: ['5'],
				svelteFileTypes: ['.svelte', '.svelte.[js|ts]']
			}
		]
	},
	create(context) {
		const ignoreEncapsulatedLocalVariables =
			context.options[0]?.ignoreEncapsulatedLocalVariables ?? true;
		const returnedFunctionCalls: Map<FunctionLike, TSESTree.MethodDefinition[]> = new Map();
		const returnedVariables: Map<FunctionLike, VariableLike[]> = new Map();
		const exportedVars: TSESTree.Node[] = [];

		function recordReturnedIdentifiers(node: TSESTree.Identifier | TSESTree.PrivateIdentifier) {
			function recordVariable(enclosingFunction: FunctionLike, variable: VariableLike): void {
				if (variable === null) {
					return;
				}
				if (!returnedVariables.has(enclosingFunction)) {
					returnedVariables.set(enclosingFunction, []);
				}
				returnedVariables.get(enclosingFunction)?.push(variable);
			}

			function recordFunctionCall(
				enclosingFunction: FunctionLike,
				functionCall: TSESTree.MethodDefinition
			): void {
				if (functionCall === null) {
					return;
				}
				if (!returnedFunctionCalls.has(enclosingFunction)) {
					returnedFunctionCalls.set(enclosingFunction, []);
				}
				returnedFunctionCalls.get(enclosingFunction)?.push(functionCall);
			}

			const enclosingReturn = findEnclosingReturn(node);
			if (enclosingReturn === null) {
				return;
			}
			const enclosingFunction = findEnclosingFunction(enclosingReturn);
			if (enclosingFunction === null) {
				return;
			}
			if (node.parent.type === 'MemberExpression') {
				const enclosingClassBody = findEnclosingClassBody(node);
				for (const classElement of enclosingClassBody?.body ?? []) {
					if (
						classElement.type === 'PropertyDefinition' &&
						(classElement.key.type === 'Identifier' ||
							classElement.key.type === 'PrivateIdentifier') &&
						node.name === classElement.key.name
					) {
						recordVariable(enclosingFunction, classElement);
					}
					if (
						classElement.type === 'MethodDefinition' &&
						(classElement.key.type === 'Identifier' ||
							classElement.key.type === 'PrivateIdentifier') &&
						node.name === classElement.key.name
					) {
						recordFunctionCall(enclosingFunction, classElement);
					}
				}
			} else if (node.type === 'Identifier') {
				const variable = findVariable(context, node);
				if (
					variable !== null &&
					variable.identifiers.length > 0 &&
					variable.identifiers[0].parent.type === 'VariableDeclarator'
				) {
					recordVariable(enclosingFunction, variable.identifiers[0].parent);
				}
			}
		}

		return {
			...(getSvelteContext(context)?.svelteFileType === '.svelte.[js|ts]' && {
				ExportNamedDeclaration(node) {
					if (node.declaration !== null) {
						exportedVars.push(node.declaration);
					}
					for (const specifier of node.specifiers) {
						if (specifier.local.type !== 'Identifier') {
							continue;
						}
						const defs = findVariable(context, specifier.local)?.defs ?? [];
						for (const def of defs) {
							exportedVars.push(def.node);
						}
					}
				},
				ExportDefaultDeclaration(node) {
					if (node.declaration.type === 'Identifier') {
						const defs = findVariable(context, node.declaration)?.defs ?? [];
						for (const def of defs) {
							exportedVars.push(def.node);
						}
					} else {
						exportedVars.push(node.declaration);
					}
				}
			}),
			Identifier: recordReturnedIdentifiers,
			PrivateIdentifier: recordReturnedIdentifiers,
			'Program:exit'() {
				const referenceTracker = new ReferenceTracker(context.sourceCode.scopeManager.globalScope!);
				for (const { node, path } of referenceTracker.iterateGlobalReferences({
					Date: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					Map: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					Set: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					URL: {
						[ReferenceTracker.CONSTRUCT]: true
					},
					URLSearchParams: {
						[ReferenceTracker.CONSTRUCT]: true
					}
				})) {
					const messageId =
						path[0] === 'Date'
							? 'mutableDateUsed'
							: path[0] === 'Map'
								? 'mutableMapUsed'
								: path[0] === 'Set'
									? 'mutableSetUsed'
									: path[0] === 'URL'
										? 'mutableURLUsed'
										: 'mutableURLSearchParamsUsed';
					for (const exportedVar of exportedVars) {
						if (isIn(node, exportedVar)) {
							context.report({
								messageId,
								node
							});
						}
					}
					for (const [fn, fnReturnVars] of returnedVariables.entries()) {
						for (const returnedVar of fnReturnVars) {
							if (fn.type === 'MethodDefinition' && returnedVar.type === 'PropertyDefinition') {
								continue;
							}
							if (isIn(node, returnedVar)) {
								context.report({
									messageId,
									node
								});
							}
						}
					}
					const enclosingPropertyDefinition = findEnclosingPropertyDefinition(node);
					if (
						findEnclosingReturn(node) !== null ||
						(enclosingPropertyDefinition !== null &&
							(!ignoreEncapsulatedLocalVariables ||
								!isPropertyEncapsulated(
									enclosingPropertyDefinition,
									returnedFunctionCalls,
									returnedVariables
								)))
					) {
						context.report({
							messageId,
							node
						});
					}
					if (ignoreEncapsulatedLocalVariables && isLocalVarEncapsulated(returnedVariables, node)) {
						continue;
					}
					if (path[0] === 'Date' && isDateMutable(referenceTracker, node as TSESTree.Expression)) {
						context.report({
							messageId: 'mutableDateUsed',
							node
						});
					}
					if (path[0] === 'Map' && isMapMutable(referenceTracker, node as TSESTree.Expression)) {
						context.report({
							messageId: 'mutableMapUsed',
							node
						});
					}
					if (path[0] === 'Set' && isSetMutable(referenceTracker, node as TSESTree.Expression)) {
						context.report({
							messageId: 'mutableSetUsed',
							node
						});
					}
					if (path[0] === 'URL' && isURLMutable(referenceTracker, node as TSESTree.Expression)) {
						context.report({
							messageId: 'mutableURLUsed',
							node
						});
					}
					if (
						path[0] === 'URLSearchParams' &&
						isURLSearchParamsMutable(referenceTracker, node as TSESTree.Expression)
					) {
						context.report({
							messageId: 'mutableURLSearchParamsUsed',
							node
						});
					}
				}
			}
		};
	}
});

function findAncestorOfTypes<T extends string>(
	node: TSESTree.Node,
	types: string[]
): (TSESTree.Node & { type: T }) | null {
	if (types.includes(node.type)) {
		return node as TSESTree.Node & { type: T };
	}
	if (node.parent === undefined || node.parent === null) {
		return null;
	}
	return findAncestorOfTypes(node.parent, types);
}

function findEnclosingClassBody(node: TSESTree.Node): TSESTree.ClassBody | null {
	return findAncestorOfTypes(node, ['ClassBody']);
}

function findEnclosingFunction(
	node: TSESTree.Node
): TSESTree.ArrowFunctionExpression | TSESTree.FunctionDeclaration | null {
	return findAncestorOfTypes(node, [
		'ArrowFunctionExpression',
		'FunctionDeclaration',
		'MethodDefinition'
	]);
}

function findEnclosingPropertyDefinition(node: TSESTree.Node): TSESTree.PropertyDefinition | null {
	return findAncestorOfTypes(node, ['PropertyDefinition']);
}

function findEnclosingReturn(node: TSESTree.Node): TSESTree.ReturnStatement | null {
	return findAncestorOfTypes(node, ['ReturnStatement']);
}

function isLocalVarEncapsulated(
	returnedVariables: Map<FunctionLike, VariableLike[]>,
	node: TSESTree.Node
): boolean {
	const enclosingFunction = findEnclosingFunction(node);
	if (enclosingFunction === null) {
		return false;
	}
	return (
		returnedVariables.get(enclosingFunction)?.some((variable) => isIn(node, variable)) !== true
	);
}

function methodReturnsProperty(
	method: TSESTree.MethodDefinition,
	property: TSESTree.PropertyDefinition,
	returnedFunctionCalls: Map<FunctionLike, TSESTree.MethodDefinition[]>,
	returnedVariables: Map<FunctionLike, VariableLike[]>
): boolean {
	return (
		(returnedVariables.get(method)?.includes(property) ?? false) ||
		(returnedFunctionCalls
			.get(method)
			?.some((calledFn) =>
				methodReturnsProperty(calledFn, property, returnedFunctionCalls, returnedVariables)
			) ??
			false)
	);
}

function isPropertyEncapsulated(
	node: TSESTree.PropertyDefinition,
	returnedFunctionCalls: Map<FunctionLike, TSESTree.MethodDefinition[]>,
	returnedVariables: Map<FunctionLike, VariableLike[]>
): boolean {
	if (isPublic(node)) {
		return false;
	}
	for (const classElement of node.parent.body) {
		if (
			classElement.type === 'MethodDefinition' &&
			isPublic(classElement) &&
			methodReturnsProperty(classElement, node, returnedFunctionCalls, returnedVariables)
		) {
			return false;
		}
	}
	return true;
}

function isPublic(node: TSESTree.MethodDefinition | TSESTree.PropertyDefinition): boolean {
	return (
		(node.accessibility === undefined && node.key.type !== 'PrivateIdentifier') ||
		node.accessibility === 'public'
	);
}

function isDateMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return !referenceTracker
		.iteratePropertyReferences(ctorNode, {
			setDate: {
				[ReferenceTracker.CALL]: true
			},
			setFullYear: {
				[ReferenceTracker.CALL]: true
			},
			setHours: {
				[ReferenceTracker.CALL]: true
			},
			setMilliseconds: {
				[ReferenceTracker.CALL]: true
			},
			setMinutes: {
				[ReferenceTracker.CALL]: true
			},
			setMonth: {
				[ReferenceTracker.CALL]: true
			},
			setSeconds: {
				[ReferenceTracker.CALL]: true
			},
			setTime: {
				[ReferenceTracker.CALL]: true
			},
			setUTCDate: {
				[ReferenceTracker.CALL]: true
			},
			setUTCFullYear: {
				[ReferenceTracker.CALL]: true
			},
			setUTCHours: {
				[ReferenceTracker.CALL]: true
			},
			setUTCMilliseconds: {
				[ReferenceTracker.CALL]: true
			},
			setUTCMinutes: {
				[ReferenceTracker.CALL]: true
			},
			setUTCMonth: {
				[ReferenceTracker.CALL]: true
			},
			setUTCSeconds: {
				[ReferenceTracker.CALL]: true
			},
			setYear: {
				[ReferenceTracker.CALL]: true
			}
		})
		.next().done;
}

function isMapMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return !referenceTracker
		.iteratePropertyReferences(ctorNode, {
			clear: {
				[ReferenceTracker.CALL]: true
			},
			delete: {
				[ReferenceTracker.CALL]: true
			},
			set: {
				[ReferenceTracker.CALL]: true
			}
		})
		.next().done;
}

function isSetMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return !referenceTracker
		.iteratePropertyReferences(ctorNode, {
			add: {
				[ReferenceTracker.CALL]: true
			},
			clear: {
				[ReferenceTracker.CALL]: true
			},
			delete: {
				[ReferenceTracker.CALL]: true
			}
		})
		.next().done;
}

function isURLMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	for (const { node } of referenceTracker.iteratePropertyReferences(ctorNode, {
		hash: {
			[ReferenceTracker.READ]: true
		},
		host: {
			[ReferenceTracker.READ]: true
		},
		hostname: {
			[ReferenceTracker.READ]: true
		},
		href: {
			[ReferenceTracker.READ]: true
		},
		password: {
			[ReferenceTracker.READ]: true
		},
		pathname: {
			[ReferenceTracker.READ]: true
		},
		port: {
			[ReferenceTracker.READ]: true
		},
		protocol: {
			[ReferenceTracker.READ]: true
		},
		search: {
			[ReferenceTracker.READ]: true
		},
		username: {
			[ReferenceTracker.READ]: true
		}
	})) {
		if (node.parent.type === 'AssignmentExpression' && node.parent.left === node) {
			return true;
		}
	}
	return false;
}

function isURLSearchParamsMutable(
	referenceTracker: ReferenceTracker,
	ctorNode: TSESTree.Expression
): boolean {
	return !referenceTracker
		.iteratePropertyReferences(ctorNode, {
			append: {
				[ReferenceTracker.CALL]: true
			},
			delete: {
				[ReferenceTracker.CALL]: true
			},
			set: {
				[ReferenceTracker.CALL]: true
			},
			sort: {
				[ReferenceTracker.CALL]: true
			}
		})
		.next().done;
}
