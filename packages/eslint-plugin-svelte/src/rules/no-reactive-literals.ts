import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-reactive-literals', {
	meta: {
		docs: {
			description: "don't assign literal values in reactive statements",
			category: 'Best Practices',
			recommended: false
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			noReactiveLiterals: `Do not assign literal values inside reactive statements unless absolutely necessary.`,
			fixReactiveLiteral: `Move the literal out of the reactive statement into an assignment`
		},
		type: 'suggestion'
	},
	create(context) {
		return {
			[`SvelteReactiveStatement > ExpressionStatement > AssignmentExpression:matches(${[
				// $: foo = "foo";
				// $: foo = 1;
				`[right.type="Literal"]`,

				// $: foo = [];
				`[right.type="ArrayExpression"][right.elements.length=0]`,

				// $: foo = {};
				`[right.type="ObjectExpression"][right.properties.length=0]`
			].join(',')})`](node: TSESTree.AssignmentExpression) {
				// Move upwards to include the entire reactive statement
				const parent = node.parent?.parent;

				if (!parent) {
					return false;
				}

				const source = getSourceCode(context);

				return context.report({
					node: parent,
					loc: parent.loc,
					messageId: 'noReactiveLiterals',
					suggest: [
						{
							messageId: 'fixReactiveLiteral',
							fix(fixer) {
								return [
									// Insert "let" + whatever was in there
									fixer.insertTextBefore(parent, `let ${source.getText(node)}`),

									// Remove the original reactive statement
									fixer.remove(parent)
								];
							}
						}
					]
				});
			}
		};
	}
});
