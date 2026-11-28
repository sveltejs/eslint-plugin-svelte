import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';

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

				return context.report({
					node: parent,
					loc: parent.loc,
					messageId: 'noReactiveLiterals',
					// `let` can only be put before a plain `=` to a name or a destructuring of names.
					suggest: !(node.operator === '=' && isDeclarablePattern(node.left))
						? []
						: [
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

/** Checks whether the given node can be the target of a `let` declaration. */
function isDeclarablePattern(node: TSESTree.Node | null): boolean {
	if (!node) {
		// A hole in an array pattern, e.g. `[, a]`
		return true;
	}
	switch (node.type) {
		case 'Identifier':
			return true;
		case 'ArrayPattern':
			return node.elements.every(isDeclarablePattern);
		case 'ObjectPattern':
			return node.properties.every((property) =>
				property.type === 'RestElement'
					? isDeclarablePattern(property.argument)
					: isDeclarablePattern(property.value)
			);
		case 'RestElement':
			return isDeclarablePattern(node.argument);
		case 'AssignmentPattern':
			return isDeclarablePattern(node.left);
		default:
			return false;
	}
}
