import type { Variable } from '@typescript-eslint/scope-manager';
import { createRule } from '../utils';
import { getSourceCode } from '../utils/compat';

import {
	createNodeReporter,
	groupByDestructuring,
	isInitOfForStatement
} from './prefer-const-helpers';

export default createRule('prefer-const', {
	meta: {
		type: 'suggestion',
		docs: {
			description:
				'Require `const` declarations for variables that are never reassigned after declared (excluding Svelte reactive values).',
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
		const sourceCode = getSourceCode(context);

		const options = context.options[0] || {};
		const ignoreReadBeforeAssign = options.ignoreReadBeforeAssign === true;

		const variables: Variable[] = [];

		return {
			'Program:exit'() {
				const nodeReporter = createNodeReporter(context, {
					destructuring: options.destructuring
				});
				groupByDestructuring(variables, ignoreReadBeforeAssign).forEach((group) => {
					nodeReporter.report(group);
				});
			},
			VariableDeclaration(node) {
				if (node.kind === 'let' && !isInitOfForStatement(node)) {
					variables.push(...sourceCode.getDeclaredVariables(node));
				}
			}
		};
	}
});
