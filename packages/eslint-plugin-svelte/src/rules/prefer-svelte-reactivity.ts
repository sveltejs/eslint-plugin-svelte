import { ReferenceTracker } from '@eslint-community/eslint-utils';
import { createRule } from '../utils/index.js';
import type { TSESTree } from '@typescript-eslint/types';

export default createRule('prefer-svelte-reactivity', {
	meta: {
		docs: {
			description:
				'disallow using built-in classes where a reactive alternative is provided by svelte/reactivity',
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
		type: 'problem', // 'problem', or 'layout',
		conditions: [
			{
				svelteVersions: ['5'],
				svelteFileTypes: ['.svelte', '.svelte.[js|ts]']
			}
		]
	},
	create(context) {
		return {
			Program() {
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

function isDateMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return (
		Array.from(
			referenceTracker.iteratePropertyReferences(ctorNode, {
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
		).length > 0
	);
}

function isMapMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return (
		Array.from(
			referenceTracker.iteratePropertyReferences(ctorNode, {
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
		).length > 0
	);
}

function isSetMutable(referenceTracker: ReferenceTracker, ctorNode: TSESTree.Expression): boolean {
	return (
		Array.from(
			referenceTracker.iteratePropertyReferences(ctorNode, {
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
		).length > 0
	);
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
		if (node.parent.type === 'AssignmentExpression') {
			return true;
		}
	}
	return false;
}

function isURLSearchParamsMutable(
	referenceTracker: ReferenceTracker,
	ctorNode: TSESTree.Expression
): boolean {
	return (
		Array.from(
			referenceTracker.iteratePropertyReferences(ctorNode, {
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
		).length > 0
	);
}
