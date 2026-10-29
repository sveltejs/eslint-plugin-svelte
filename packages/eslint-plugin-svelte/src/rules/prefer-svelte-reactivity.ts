import { getPropertyName, ReferenceTracker } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';
import { findVariable, getScope, isIn } from '../utils/ast-utils.js';
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
		schema: [
			{
				type: 'object',
				properties: {
					ignoreLocalVariables: {
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
		const ignoreLocalVariables = context.options[0]?.ignoreLocalVariables ?? true;
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
					const locality = getInstanceLocality(context, node, path[0]);
					if (ignoreLocalVariables && locality === 'local') {
						continue;
					}

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
					if (ignoreLocalVariables && locality === 'escaping') {
						context.report({ messageId, node });
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

/** Classify instances conservatively so values escaping a local scope are still reported. */
function getInstanceLocality(
	context: RuleContext,
	node: TSESTree.Node,
	className: string
): 'local' | 'escaping' | 'top-level' {
	const declarator = node.parent;
	if (declarator?.type === 'MemberExpression' && declarator.object === node) {
		return isSafeLocalMember(context, declarator, className) ? 'top-level' : 'escaping';
	}
	if (declarator?.type === 'ExpressionStatement') {
		return 'top-level';
	}
	if (
		declarator?.type !== 'VariableDeclarator' ||
		declarator.init !== node ||
		declarator.id.type !== 'Identifier'
	) {
		return 'escaping';
	}
	const variable = findVariable(context, declarator.id);
	if (!variable) {
		return 'escaping';
	}
	if (variable.scope.type === 'module' || variable.scope.type === 'global') {
		return 'top-level';
	}
	for (const reference of variable.references) {
		if (reference.identifier === declarator.id) {
			continue;
		}
		const parent = reference.identifier.parent;
		if (
			reference.from.variableScope !== variable.scope.variableScope ||
			parent.type !== 'MemberExpression' ||
			parent.object !== reference.identifier
		) {
			return 'escaping';
		}
		if (!isSafeLocalMember(context, parent, className)) {
			return 'escaping';
		}
	}
	return 'local';
}

// Only native operations with known receiver behavior can establish local use.
const LOCAL_METHODS: Readonly<Record<string, readonly string[]>> = {
	Date: [
		'getDate',
		'getDay',
		'getFullYear',
		'getHours',
		'getMilliseconds',
		'getMinutes',
		'getMonth',
		'getSeconds',
		'getTime',
		'getTimezoneOffset',
		'getUTCDate',
		'getUTCDay',
		'getUTCFullYear',
		'getUTCHours',
		'getUTCMilliseconds',
		'getUTCMinutes',
		'getUTCMonth',
		'getUTCSeconds',
		'getYear',
		'setDate',
		'setFullYear',
		'setHours',
		'setMilliseconds',
		'setMinutes',
		'setMonth',
		'setSeconds',
		'setTime',
		'setUTCDate',
		'setUTCFullYear',
		'setUTCHours',
		'setUTCMilliseconds',
		'setUTCMinutes',
		'setUTCMonth',
		'setUTCSeconds',
		'setYear',
		'toDateString',
		'toISOString',
		'toJSON',
		'toLocaleDateString',
		'toLocaleString',
		'toLocaleTimeString',
		'toString',
		'toTimeString',
		'toUTCString',
		'toGMTString',
		'valueOf'
	],
	Map: ['clear', 'delete', 'get', 'has', 'set'],
	Set: ['add', 'clear', 'delete', 'has'],
	URL: ['toJSON', 'toString'],
	URLSearchParams: ['append', 'delete', 'get', 'getAll', 'has', 'set', 'sort', 'toString']
};
const URL_PROPERTIES = [
	'hash',
	'host',
	'hostname',
	'href',
	'origin',
	'password',
	'pathname',
	'port',
	'protocol',
	'search',
	'username'
];

/** Reject unknown operations and operations that can expose the receiver. */
function isSafeLocalMember(
	context: RuleContext,
	member: TSESTree.MemberExpression,
	className: string
): boolean {
	const name = getPropertyName(member, getScope(context, member));
	if (!name) {
		return false;
	}
	const parent = member.parent;
	if (className === 'URL' && name === 'searchParams') {
		return (
			parent.type === 'MemberExpression' &&
			parent.object === member &&
			isSafeLocalMember(context, parent, 'URLSearchParams')
		);
	}
	if (className === 'URL' && URL_PROPERTIES.includes(name)) {
		return true;
	}
	if (
		(className === 'Map' || className === 'Set' || className === 'URLSearchParams') &&
		name === 'size'
	) {
		return parent.type !== 'AssignmentExpression' && parent.type !== 'UpdateExpression';
	}
	if (parent.type !== 'CallExpression' || parent.callee !== member) {
		return false;
	}
	if (
		name === 'forEach' &&
		(className === 'Map' || className === 'Set' || className === 'URLSearchParams')
	) {
		const callback = parent.arguments[0];
		// An unknown callback, arguments object, or collection parameter may expose the receiver.
		return (
			callback?.type === 'ArrowFunctionExpression' &&
			callback.params.length <= 2 &&
			callback.params.every((parameter) => parameter.type !== 'RestElement')
		);
	}
	if (!LOCAL_METHODS[className]?.includes(name)) {
		return false;
	}
	if ((className === 'Set' && name === 'add') || (className === 'Map' && name === 'set')) {
		return parent.parent.type === 'ExpressionStatement';
	}
	return true;
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
