import { createRule } from '../../utils/index.js';
import { defineWrapperListener, getProxyContent, getCoreRule } from '../../utils/eslint-core.js';
import type { TSESTree } from '@typescript-eslint/types';
import type { Scope } from '@typescript-eslint/scope-manager';
import type { Range } from 'svelte-eslint-parser/lib/ast/common.js';
import { getScope as getScopeUtil } from '../../utils/ast-utils.js';
import { getSourceCode as getSourceCodeCompat } from '../../utils/compat.js';

const coreRule = getCoreRule('@typescript-eslint/no-shadow');

function removeSnippetIdentifiers(snippetIdentifierNodeLocations: Range[], scope: Scope): Scope {
	return {
		...scope,
		variables: scope.variables.filter((variable) => {
			return !snippetIdentifierNodeLocations.some(([start, end]) => {
				return variable.identifiers.every((identifier) => {
					const { range } = identifier;
					return range[0] === start && range[1] === end;
				});
			});
		}),
		childScopes: scope.childScopes.map((scope) => {
			return removeSnippetIdentifiers(snippetIdentifierNodeLocations, scope);
		})
	} as Scope;
}

export default createRule('@typescript-eslint/no-shadow', {
	meta: {
		...coreRule.meta,
		docs: {
			description: coreRule.meta.docs.description,
			category: 'Best Practices',
			recommended: false,
			extensionRule: '@typescript-eslint/no-shadow'
		}
	},
	create(context) {
		const snippetIdentifierNodeLocations: Range[] = [];

		function getScope(node: TSESTree.Node) {
			const scope = getScopeUtil(context, node);
			return removeSnippetIdentifiers(snippetIdentifierNodeLocations, scope);
		}

		function getSourceCode() {
			const sourceCode = getSourceCodeCompat(context);
			return new Proxy(sourceCode, {
				get(target, key) {
					if (key === 'getScope') {
						return getScope;
					}
					// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
					return (target as any)[key];
				}
			});
		}

		return defineWrapperListener(
			coreRule,
			getProxyContent(context, {
				sourceCode: getSourceCode()
			}),
			{
				createListenerProxy(coreListener) {
					return {
						...coreListener,
						SvelteSnippetBlock(node) {
							const parent = node.parent;
							if (parent.type === 'SvelteElement' && parent.kind === 'component') {
								snippetIdentifierNodeLocations.push(node.id.range);
							}
							coreListener.SvelteSnippetBlock?.(node);
						},
						'Program:exit'(node) {
							coreListener['Program:exit']?.(node);
						}
					};
				}
			}
		);
	}
});
