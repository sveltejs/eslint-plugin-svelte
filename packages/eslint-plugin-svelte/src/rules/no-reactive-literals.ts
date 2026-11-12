import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import type { RuleContext } from '../types.js';
import { findVariable, iterateIdentifiers } from '../utils/ast-utils.js';

/**
 * Checks whether a name on the left side is already declared (e.g. by `let`, `import` or `function`).
 * Names that only come from `$: name = ...` have a `ComputedVariable` def.
 */
function hasDeclaredName(context: RuleContext, node: TSESTree.AssignmentExpression): boolean {
	for (const id of iterateIdentifiers(node.left as TSESTree.DestructuringPattern)) {
		const variable = findVariable(context, id);
		if (variable?.defs.some((def) => (def.type as string) !== 'ComputedVariable')) {
			return true;
		}
	}
	return false;
}

export default createRule('no-reactive-literals', {
	meta: {
		docs: {
			description: "don't assign literal values in reactive statements",
			category: 'Best Practices',
			recommended: true
		},
		hasSuggestions: true,
		schema: [],
		messages: {
			noReactiveLiterals: `Do not assign literal values inside reactive statements unless absolutely necessary.`,
			fixReactiveLiteral: `Move the literal out of the reactive statement into an assignment`
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['3/4']
			},
			{
				svelteVersions: ['5'],
				runes: [false, 'undetermined']
			}
		]
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

				const source = context.sourceCode;

				// `let` would declare the name a second time, so do not give a suggestion.
				if (hasDeclaredName(context, node)) {
					return context.report({
						node: parent,
						loc: parent.loc,
						messageId: 'noReactiveLiterals'
					});
				}

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
