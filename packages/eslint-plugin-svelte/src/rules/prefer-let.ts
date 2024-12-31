import type { TSESTree } from '@typescript-eslint/types';

import { createRule } from '../utils/index.js';

type ReactiveFunction = '$props' | '$derived' | '$derived.by' | '$state' | '$state.raw';
const DEFAULT_FUNCTIONS: ReactiveFunction[] = [
	'$props',
	'$derived',
	'$derived.by',
	'$state',
	'$state.raw'
];

function getReactiveFunction(callExpr: TSESTree.CallExpression, validNames: string[]) {
	if (callExpr.callee.type === 'Identifier') {
		if (validNames.includes(callExpr.callee.name)) {
			return callExpr.callee.name as ReactiveFunction;
		}
	} else if (
		callExpr.callee.type === 'MemberExpression' &&
		callExpr.callee.object.type === 'Identifier' &&
		callExpr.callee.property.type === 'Identifier'
	) {
		const fullName = `${callExpr.callee.object.name}.${callExpr.callee.property.name}`;

		if (validNames.includes(fullName)) {
			return fullName as ReactiveFunction;
		}
	}

	return null;
}

export default createRule('prefer-let', {
	meta: {
		docs: {
			description: 'Prefer `let` over `const` for Svelte 5 reactive variable declarations.',
			category: 'Best Practices',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					exclude: {
						type: 'array',
						items: {
							enum: ['$props', '$derived', '$derived.by', '$state', '$state.raw']
						},
						uniqueItems: true
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			'use-let': "'const' is used for a reactive declaration from {{rune}}. Use 'let' instead."
		},
		type: 'suggestion',
		fixable: 'code'
	},
	create(context) {
		const exclude = context.options[0]?.exclude ?? [];
		const allowedNames = DEFAULT_FUNCTIONS.filter((name) => !exclude.includes(name));

		return {
			VariableDeclaration(node: TSESTree.VariableDeclaration) {
				if (node.kind === 'const') {
					node.declarations.forEach((declarator) => {
						const init = declarator.init;

						if (!init || init.type !== 'CallExpression') {
							return;
						}

						const rune = getReactiveFunction(init, allowedNames);
						if (rune) {
							context.report({
								node,
								messageId: 'use-let',
								data: { rune },
								fix: (fixer) => fixer.replaceTextRange([node.range[0], node.range[0] + 5], 'let')
							});
						}
					});
				}
			}
		};
	}
});
