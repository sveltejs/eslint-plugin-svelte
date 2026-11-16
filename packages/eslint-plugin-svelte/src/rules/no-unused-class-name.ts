import { createRule } from '../utils/index.js';
import type { AST } from 'svelte-eslint-parser';
import type { AnyNode } from 'postcss';
import type { Node as SelectorNode } from 'postcss-selector-parser';
import { findClassesInAttribute } from '../utils/ast-utils.js';
import type { SourceCode } from '../types.js';
import { toRegExp } from '../utils/regexp.js';
import { parseSelector } from '../utils/css-utils/index.js';

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
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const allowedClassNames = context.options[0]?.allowedClassNames ?? [];
		const classesUsedInTemplate: {
			className: string;
			loc: AST.SourceLocation;
		}[] = [];

		return {
			SvelteElement(node) {
				if (node.kind !== 'html') {
					return;
				}
				const classes = node.startTag.attributes.flatMap(findClassesInAttribute);
				for (const className of classes) {
					classesUsedInTemplate.push({ className, loc: node.startTag.loc });
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
				if (classesUsedInStyle === null) {
					// A selector could not be parsed, so we don't know which classes are used.
					return;
				}

				for (const { className, loc } of classesUsedInTemplate) {
					if (
						!allowedClassNames.some((allowedClassName: string) =>
							toRegExp(allowedClassName).test(className)
						) &&
						!classesUsedInStyle.includes(className)
					) {
						context.report({
							loc,
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
 * Returns null if a selector can't be parsed.
 */
function findClassesInPostCSSNode(
	node: AnyNode,
	parserServices: SourceCode['parserServices']
): string[] | null {
	const classes: string[] = [];
	if (node.type === 'rule') {
		const selectorAST = parseSelector(node, parserServices.getStyleSelectorAST!);
		if (selectorAST === null) {
			return null;
		}
		classes.push(...findClassesInSelector(selectorAST));
	}
	if (
		(node.type === 'root' || node.type === 'rule' || node.type === 'atrule') &&
		node.nodes !== undefined
	) {
		for (const child of node.nodes) {
			const childClasses = findClassesInPostCSSNode(child, parserServices);
			if (childClasses === null) {
				return null;
			}
			classes.push(...childClasses);
		}
	}
	return classes;
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
