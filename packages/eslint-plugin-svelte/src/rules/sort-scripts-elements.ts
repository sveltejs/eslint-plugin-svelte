import { createRule } from '../utils/index.js';
import type { RuleContext } from '../types.js';
import type { AST } from 'svelte-eslint-parser';

const DEFAULT_ORDER: string[] = [
	'ImportDeclaration',
	'TSTypeAliasDeclaration',
	'VariableDeclaration',
	'FunctionDeclaration'
];

// creating and exporting the rule
export default createRule('sort-scripts-elements', {
	meta: {
		docs: {
			description: 'enforce order of elements in the Svelte scripts sections',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
		},
		schema: [],
		messages: {
			scriptsIsNotSorted: 'Scripts is not sorted.'
		},
		type: 'layout',
		fixable: 'code'
	},
	create(context: RuleContext) {
		const sourceCode = context.sourceCode;
		const MAPPING = new Map<string, number>(DEFAULT_ORDER.map((value, index) => [value, index]));

		return {
			SvelteScriptElement(node: AST.SvelteScriptElement) {
				// do not accept scripts without closing tags
				if (node.endTag === null) return;
				const svelteEndTag: AST.SvelteEndTag = node.endTag;

				// collect scripts statement
				const statements = node.body;
				// do not sort when we only have one elements
				if (statements.length <= 1) return;

				const seens = new Set<string>();
				let current: string = statements[0].type;

				let sortingRequired = false;
				for (let i = 0; i < statements.length; i++) {
					// if we are the same as previous
					if (seens.has(statements[i].type) && statements[i].type === current) {
						continue;
					}

					if (i > 0) {
						const previousOrderIndex = MAPPING.get(current);
						const currentOrderIndex = MAPPING.get(statements[i].type);
						if (previousOrderIndex !== undefined && currentOrderIndex !== undefined) {
							if (previousOrderIndex > currentOrderIndex) {
								sortingRequired = true;
								break;
							}
						}
					}

					// mark the node type as seen
					seens.add(statements[i].type);
					current = statements[i].type;
				}

				if (!sortingRequired) return;

				context.report({
					node,
					messageId: 'scriptsIsNotSorted',
					fix: (fixer) => {
						const foo: { order: number; text: string }[] = [];

						for (let i = 0; i < statements.length; i++) {
							// Getting the comments between previous and current statement
							const comments = sourceCode
								.getCommentsInside({
									type: 'Null',
									range: [
										// Get comment between the last statement and current
										i === 0 ? node.startTag.range[1] : statements[i - 1].range[1],
										i === statements.length - 1 ? svelteEndTag.range[0] : statements[i].range[0]
									]
								})
								.map((comment) => sourceCode.getText(comment));

							/**
							 * We need to handle the missing \t\n
							 * Example when i === 0 we should take the startTag.range[1] up to the first statement if no comments
							 * Same between statements etc.
							 * sourceCode.getText(statements[i], (statements[i].range[0]) - (node.startTag.range[1] + 1))
							 */
							foo.push({
								order: MAPPING.get(statements[i].type) ?? Number.MAX_SAFE_INTEGER,
								text: comments.join('') + sourceCode.getText(statements[i])
							});
						}

						const text = foo
							.sort((a, b) => a.order - b.order)
							.map(({ text }) => text)
							.join('\n');

						return [
							fixer.replaceTextRange([node.startTag.range[1] + 1, svelteEndTag.range[0] - 1], text)
						];
					}
				});
			}
		};
	}
});
