import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';
import { findVariable, isIn } from '../utils/ast-utils.js';
import { getSvelteContext } from '../utils/svelte-context.js';
import type { RuleContext } from '../types.js';

export default createRule('prefer-svelte-reactivity', {
	meta: {
		docs: {
			description:
				'disallow using mutable instances of built-in classes where a reactive alternative is provided by svelte/reactivity',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [],
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
				svelteFileTypes: ['.svelte', '.svelte.[js|ts]'],
				runes: [true, 'undetermined']
			}
		]
	},
	create(context) {
		const exportedVars: TSESTree.Node[] = [];
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
					if (isLocalToFunction(context, node as TSESTree.Expression)) {
						// The instance can't be observed after the function returns,
						// so it doesn't need to be reactive.
						continue;
					}
					for (const exportedVar of exportedVars) {
						if (isIn(node, exportedVar)) {
							context.report({
								messageId,
								node
							});
						}
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

type FunctionNode =
	| TSESTree.FunctionDeclaration
	| TSESTree.FunctionExpression
	| TSESTree.ArrowFunctionExpression;

function getEnclosingFunction(node: TSESTree.Node): FunctionNode | null {
	let current = node.parent;
	while (current) {
		if (
			current.type === 'FunctionDeclaration' ||
			current.type === 'FunctionExpression' ||
			current.type === 'ArrowFunctionExpression'
		) {
			return current;
		}
		current = current.parent;
	}
	return null;
}

/**
 * Checks whether the instance is created inside a function and never leaves it,
 * e.g. it is not returned, stored outside, or used by a nested function.
 */
function isLocalToFunction(context: RuleContext, ctorNode: TSESTree.Expression): boolean {
	const fn = getEnclosingFunction(ctorNode);
	if (!fn) return false;

	const parent = ctorNode.parent;
	// A temporary instance, e.g. `new Date(date).setHours(0)`
	if (parent.type === 'MemberExpression' && parent.object === ctorNode) {
		return true;
	}
	if (
		parent.type !== 'VariableDeclarator' ||
		parent.init !== ctorNode ||
		parent.id.type !== 'Identifier'
	) {
		return false;
	}
	const variable = findVariable(context, parent.id);
	if (!variable) return false;
	return variable.references.every((reference) => {
		if (reference.init) return true;
		const identifier = reference.identifier as TSESTree.Identifier;
		if (getEnclosingFunction(identifier) !== fn) return false;
		return reference.isWrite() || !isLeaked(identifier);
	});
}

/**
 * Checks whether the value of the node may be stored or returned.
 */
function isLeaked(node: TSESTree.Node): boolean {
	const parent = node.parent;
	if (!parent) return false;
	switch (parent.type) {
		case 'ReturnStatement':
		case 'YieldExpression':
		case 'ArrayExpression':
		case 'Property':
		case 'VariableDeclarator':
			return true;
		case 'ArrowFunctionExpression':
			return parent.body === node;
		case 'AssignmentExpression':
			return parent.right === node;
		case 'AwaitExpression':
		case 'ChainExpression':
		case 'ConditionalExpression':
		case 'LogicalExpression':
		case 'SequenceExpression':
		case 'TSAsExpression':
		case 'TSNonNullExpression':
		case 'TSSatisfiesExpression':
			return isLeaked(parent);
		default:
			return false;
	}
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
