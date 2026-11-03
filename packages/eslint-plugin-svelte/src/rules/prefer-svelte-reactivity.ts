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

const TS_WRAPPER_TYPES = new Set<string>([
	'TSAsExpression',
	'TSNonNullExpression',
	'TSSatisfiesExpression',
	'TSTypeAssertion',
	'TSInstantiationExpression'
]);

/**
 * Methods that return the instance itself, e.g. `set.add(1)` returns `set`.
 */
const SELF_RETURNING_METHODS = new Set(['add', 'set']);

/**
 * Properties that return an object linked to the instance, e.g. `url.searchParams`.
 */
const LINKED_PROPERTIES = new Set(['searchParams']);

/**
 * Global functions that only read or copy their arguments and never keep them.
 */
const COPYING_FUNCTIONS = new Set(['String', 'Number', 'Boolean']);
const COPYING_CONSTRUCTORS = new Set(['Date', 'Map', 'Set', 'URL', 'URLSearchParams']);
const COPYING_STATIC_METHODS = new Map([
	['Array', new Set(['from'])],
	['JSON', new Set(['stringify'])]
]);

/**
 * Checks whether the instance is created inside a function and never leaves it,
 * e.g. it is not returned, stored outside, passed to a function, or used by a nested function or a rune.
 * When we are not sure, we treat it as leaving the function.
 */
function isLocalToFunction(context: RuleContext, ctorNode: TSESTree.Expression): boolean {
	const fn = getEnclosingFunction(ctorNode);
	if (!fn) return false;

	let expr: TSESTree.Node = ctorNode;
	while (TS_WRAPPER_TYPES.has(expr.parent!.type)) {
		expr = expr.parent!;
	}
	const parent = expr.parent!;
	if (parent.type !== 'VariableDeclarator' || parent.init !== expr) {
		// A temporary instance, e.g. `new Date(date).setHours(0)`
		return !isLeaked(context, ctorNode);
	}
	if (parent.id.type !== 'Identifier') {
		return false;
	}
	const variable = findVariable(context, parent.id);
	// A direct `eval()` can use the variable without a visible reference.
	if (!variable || hasDirectEval(variable.scope)) return false;
	return variable.references.every((reference) => {
		if (reference.init) return true;
		const identifier = reference.identifier as TSESTree.Identifier;
		if (getEnclosingFunction(identifier) !== fn) return false;
		if (isInRuneArguments(identifier, fn)) return false;
		if (reference.isWrite()) {
			// `set ||= other` evaluates to `set`.
			return !reference.isRead() || !isLeaked(context, identifier.parent);
		}
		return !isLeaked(context, identifier);
	});
}

type Scope = NonNullable<ReturnType<typeof findVariable>>['scope'];

/**
 * Checks whether the scope or its child scopes call `eval()` directly.
 */
function hasDirectEval(scope: Scope): boolean {
	return (
		scope.references.some((reference) => {
			const identifier = reference.identifier as TSESTree.Node;
			return (
				identifier.type === 'Identifier' &&
				identifier.name === 'eval' &&
				identifier.parent?.type === 'CallExpression' &&
				identifier.parent.callee === identifier
			);
		}) || scope.childScopes.some(hasDirectEval)
	);
}

/**
 * Checks whether the node is in the arguments of a rune call such as `$derived(set.size)`.
 * The compiler turns the arguments into a closure, so they may be evaluated after the function returns.
 */
function isInRuneArguments(node: TSESTree.Node, fn: FunctionNode): boolean {
	let current: TSESTree.Node = node;
	while (current.parent && current.parent !== fn) {
		const parent: TSESTree.Node = current.parent;
		if (
			(parent.type === 'CallExpression' || parent.type === 'NewExpression') &&
			parent.callee !== current
		) {
			let callee: TSESTree.Node = parent.callee;
			while (callee.type === 'MemberExpression') {
				callee = callee.object;
			}
			if (callee.type === 'Identifier' && callee.name.startsWith('$')) {
				return true;
			}
		}
		current = parent;
	}
	return false;
}

/**
 * Checks whether the value of the node may leave the function.
 * It returns `true` unless the value is surely only read in place.
 */
function isLeaked(context: RuleContext, node: TSESTree.Node): boolean {
	const parent = node.parent;
	if (!parent) return true;
	switch (parent.type) {
		case 'ExpressionStatement':
		case 'BinaryExpression':
		case 'UnaryExpression':
		case 'SpreadElement':
		case 'IfStatement':
		case 'WhileStatement':
		case 'DoWhileStatement':
		case 'ForStatement':
		case 'ForInStatement':
		case 'ForOfStatement':
		case 'SwitchStatement':
		case 'SwitchCase':
			return false;
		case 'TemplateLiteral':
			// The tag function of a tagged template receives the value.
			return parent.parent?.type === 'TaggedTemplateExpression';
		case 'ConditionalExpression':
			return parent.test !== node && isLeaked(context, parent);
		case 'SequenceExpression':
			return parent.expressions.at(-1) === node && isLeaked(context, parent);
		case 'LogicalExpression':
		case 'AwaitExpression':
		case 'ChainExpression':
			return isLeaked(context, parent);
		case 'MemberExpression':
			if (parent.object !== node) {
				// Used as a computed key, e.g. `obj[set]`
				return false;
			}
			return isMemberLeaked(context, parent);
		case 'CallExpression':
		case 'NewExpression':
			return parent.callee === node || !isCopyingCall(context, parent, node);
		default:
			return TS_WRAPPER_TYPES.has(parent.type) ? isLeaked(context, parent) : true;
	}
}

/**
 * Checks whether a member access on the instance may let the instance leave the function.
 */
function isMemberLeaked(context: RuleContext, member: TSESTree.MemberExpression): boolean {
	const parent = member.parent;
	if (
		(parent.type === 'AssignmentExpression' && parent.left === member) ||
		(parent.type === 'UpdateExpression' && parent.argument === member)
	) {
		// Mutation, e.g. `url.pathname = '/'`
		return false;
	}
	let name: string | null = null;
	if (!member.computed) {
		name = member.property.type === 'Identifier' ? member.property.name : null;
	} else if (member.property.type === 'Literal') {
		name = String(member.property.value);
	}
	if (name === null) {
		// We don't know which member is used.
		return true;
	}
	if (SELF_RETURNING_METHODS.has(name)) {
		if (parent.type === 'CallExpression' && parent.callee === member) {
			return isLeaked(context, parent);
		}
		// e.g. `const add = set.add`
		return isLeaked(context, member);
	}
	if (LINKED_PROPERTIES.has(name)) {
		return isLeaked(context, member);
	}
	if (name === 'forEach') {
		// The callback receives the instance as the third parameter.
		// (A non-arrow function can also get it through `arguments`.)
		return !(
			parent.type === 'CallExpression' &&
			parent.callee === member &&
			parent.arguments.every(
				(arg) =>
					arg.type === 'ArrowFunctionExpression' &&
					arg.params.length < 3 &&
					arg.params.every((param) => param.type !== 'RestElement')
			)
		);
	}
	return false;
}

/**
 * Checks whether the call only reads or copies the node, e.g. `Array.from(set)`.
 * The node must be the first argument, and the other arguments must not get the node,
 * e.g. through the `JSON.stringify()` replacer or the `Array.from()` `thisArg`.
 */
function isCopyingCall(
	context: RuleContext,
	call: TSESTree.CallExpression | TSESTree.NewExpression,
	node: TSESTree.Node
): boolean {
	if (call.arguments[0] !== node) return false;
	const callee = call.callee;
	if (callee.type === 'Identifier') {
		const names = call.type === 'NewExpression' ? COPYING_CONSTRUCTORS : COPYING_FUNCTIONS;
		return (
			names.has(callee.name) &&
			isGlobal(context, callee) &&
			call.arguments.slice(1).every((arg) => arg.type === 'Literal')
		);
	}
	if (
		call.type !== 'CallExpression' ||
		callee.type !== 'MemberExpression' ||
		callee.computed ||
		callee.object.type !== 'Identifier' ||
		callee.property.type !== 'Identifier' ||
		!COPYING_STATIC_METHODS.get(callee.object.name)?.has(callee.property.name) ||
		!isGlobal(context, callee.object)
	) {
		return false;
	}
	const [, second, ...rest] = call.arguments;
	if (!second) return true;
	if (callee.object.name === 'Array') {
		// `Array.from(set, (v) => v)`: an arrow function can't get the `thisArg`, and there is no `thisArg`.
		return second.type === 'ArrowFunctionExpression' && rest.length === 0;
	}
	// `JSON.stringify(set, null, 2)` or `JSON.stringify(set, ['a'], 2)`
	return (
		(second.type === 'Literal' ||
			(second.type === 'ArrayExpression' &&
				second.elements.every((element) => element?.type === 'Literal'))) &&
		rest.every((arg) => arg.type === 'Literal')
	);
}

function isGlobal(context: RuleContext, node: TSESTree.Identifier): boolean {
	const variable = findVariable(context, node);
	return !variable || variable.defs.length === 0;
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
