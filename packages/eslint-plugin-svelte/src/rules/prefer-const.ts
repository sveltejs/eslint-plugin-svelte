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
function shouldSkipDeclaration(declaration: TSESTree.Expression | null, excludedRunes: string[]) {
	if (!declaration) {
		return false;
	}

	const callee = findDeclarationCallee(declaration);
	if (!callee) {
		return false;
	}

	if (callee.type === 'Identifier' && excludedRunes.includes(callee.name)) {
		return true;
	}

	if (callee.type !== 'MemberExpression' || callee.object.type !== 'Identifier') {
		return false;
	}

	if (excludedRunes.includes(callee.object.name)) {
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
		},
		schema: [
			{
				type: 'object',
				properties: {
					destructuring: { enum: ['any', 'all'] },
					ignoreReadBeforeAssign: { type: 'boolean' },
					excludedRunes: {
						type: 'array',
						items: {
							type: 'string'
						}
					}
				},
				// Allow ESLint core rule properties in case new options are added in the future.
				additionalProperties: true
			}
		]
	},
	create(context) {
		const config = context.options[0] ?? {};
		const excludedRunes = config.excludedRunes ?? ['$props', '$derived'];

		return defineWrapperListener(coreRule, context, {
			createListenerProxy(coreListener) {
				return {
					...coreListener,
					VariableDeclaration(node) {
						for (const decl of node.declarations) {
							if (shouldSkipDeclaration(decl.init, excludedRunes)) {
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
