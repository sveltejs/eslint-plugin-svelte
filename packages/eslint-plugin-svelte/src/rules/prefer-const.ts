import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';
import { defineWrapperListener, getCoreRule } from '../utils/eslint-core.js';

const coreRule = getCoreRule('prefer-const');

/**
 * Finds and returns the callee of a declaration node within variable declarations or object patterns.
 */
function findDeclarationCallee(node: TSESTree.Expression) {
	const { parent } = node;
	if (parent.type === 'VariableDeclarator' && parent.init?.type === 'CallExpression') {
		return parent.init.callee;
	}

	return null;
}

/**
 * Determines if a declaration should be skipped in the const preference analysis.
 * Specifically checks for Svelte's state management utilities ($props, $derived).
 */
function shouldSkipDeclaration(declaration: TSESTree.Expression | null) {
	if (!declaration) {
		return false;
	}

	const callee = findDeclarationCallee(declaration);
	if (!callee) {
		return false;
	}

	if (callee.type === 'Identifier' && ['$props', '$derived'].includes(callee.name)) {
		return true;
	}

	if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') {
		return false;
	}

	if (
		callee.object.name === '$derived' &&
		callee.property.type === 'Identifier' &&
		callee.property.name === 'by'
	) {
		return true;
	}

	return false;
}

export default createRule('prefer-const', {
	meta: {
		...coreRule.meta,
		docs: {
			description: coreRule.meta.docs.description,
			category: 'Best Practices',
			recommended: false,
			extensionRule: 'prefer-const'
		}
	},
	create(context) {
		return defineWrapperListener(coreRule, context, {
			createListenerProxy(coreListener) {
				return {
					...coreListener,
					VariableDeclaration(node) {
						for (const decl of node.declarations) {
							if (shouldSkipDeclaration(decl.init)) {
								return;
							}
						}

						coreListener.VariableDeclaration?.(node);
					}
				};
			}
		});
	}
});
