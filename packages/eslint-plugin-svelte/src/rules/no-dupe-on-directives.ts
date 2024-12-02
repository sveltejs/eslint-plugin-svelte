import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import { createRule } from '../utils/index.js';
import { equalTokens } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-dupe-on-directives', {
	meta: {
		docs: {
			description: 'disallow duplicate `on:` directives',
			category: 'Possible Errors',
			recommended: false
		},
		schema: [],
		messages: {
			duplication:
				'This `on:{{type}}` directive is the same and duplicate directives in L{{lineNo}}.'
		},
		type: 'problem'
	},
	create(context) {
		const sourceCode = getSourceCode(context);

		const directiveDataMap = new Map<
			string, // event type
			{
				expression: null | TSESTree.Expression;
				nodes: AST.SvelteEventHandlerDirective[];
			}[]
		>();
		return {
			SvelteDirective(node) {
				if (node.kind !== 'EventHandler') return;

				const directiveDataList = directiveDataMap.get(node.key.name.name);
				if (!directiveDataList) {
					directiveDataMap.set(node.key.name.name, [
						{
							expression: node.expression,
							nodes: [node]
						}
					]);
					return;
				}
				const directiveData = directiveDataList.find((data) => {
					if (!data.expression || !node.expression) {
						return data.expression === node.expression;
					}
					return equalTokens(data.expression, node.expression, sourceCode);
				});
				if (!directiveData) {
					directiveDataList.push({
						expression: node.expression,
						nodes: [node]
					});
					return;
				}

				directiveData.nodes.push(node);
			},
			'SvelteStartTag:exit'() {
				for (const [type, directiveDataList] of directiveDataMap) {
					for (const { nodes } of directiveDataList) {
						if (nodes.length < 2) {
							continue;
						}
						for (const node of nodes) {
							context.report({
								node,
								messageId: 'duplication',
								data: {
									type,
									lineNo: String((nodes[0] !== node ? nodes[0] : nodes[1]).loc.start.line)
								}
							});
						}
					}
				}
				directiveDataMap.clear();
			}
		};
	}
});
