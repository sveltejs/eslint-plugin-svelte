import { createRule } from '../utils/index.js';
import type { AST } from 'svelte-eslint-parser';
import type { AnyNode } from 'postcss';
import type { Node as SelectorNode } from 'postcss-selector-parser';
import { findClassesInAttribute } from '../utils/ast-utils.js';
import { getSourceCode } from '../utils/compat.js';
import type { SourceCode } from '../types.js';

export default createRule('no-unused-class-name', {
	meta: {
		docs: {
			description: 'disallow the use of a class in the template without a corresponding style',
			category: 'Best Practices',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowedClassNames: {
						type: 'array',
						items: {
							type: 'string'
						}
					}
				},
				additionalProperties: false
			}
		],
		messages: {},
		type: 'suggestion'
	},
	create(context) {
		const sourceCode = getSourceCode(context);
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const allowedClassNames = context.options[0]?.allowedClassNames ?? [];
		const classesUsedInTemplate: Record<string, AST.SourceLocation> = {};

		return {
			SvelteElement(node) {
				if (node.kind !== 'html') {
					return;
				}
				const classes = node.startTag.attributes.flatMap(findClassesInAttribute);
				for (const className of classes) {
					classesUsedInTemplate[className] = node.startTag.loc;
				}
			},
			'Program:exit'() {
				const styleContext = sourceCode.parserServices.getStyleContext!();
				if (styleContext.status === 'parse-error' || styleContext.status === 'unknown-lang') {
					return;
				}
				const classesUsedInStyle =
					styleContext.status === 'success'
						? findClassesInPostCSSNode(styleContext.sourceAst, sourceCode.parserServices)
						: [];
				for (const className in classesUsedInTemplate) {
					if (!allowedClassNames.includes(className) && !classesUsedInStyle.includes(className)) {
						context.report({
							loc: classesUsedInTemplate[className],
							message: `Unused class "${className}".`
						});
					}
				}
			}
		};
	}
});

/**
 * Extract all class names used in a PostCSS node.
 */
function findClassesInPostCSSNode(
	node: AnyNode,
	parserServices: SourceCode['parserServices']
): string[] {
	if (node.type === 'rule') {
		let classes = node.nodes.flatMap((node) => findClassesInPostCSSNode(node, parserServices));
		classes = classes.concat(findClassesInSelector(parserServices.getStyleSelectorAST!(node)));
		return classes;
	}
	if ((node.type === 'root' || node.type === 'atrule') && node.nodes !== undefined) {
		return node.nodes.flatMap((node) => findClassesInPostCSSNode(node, parserServices));
	}
	return [];
}

/**
 * Extract all class names used in a PostCSS selector.
 */
function findClassesInSelector(node: SelectorNode): string[] {
	if (node.type === 'class') {
		return [node.value];
	}
	if (node.type === 'pseudo' || node.type === 'root' || node.type === 'selector') {
		return node.nodes.flatMap(findClassesInSelector);
	}
	return [];
}
