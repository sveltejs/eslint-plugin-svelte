import { createRule } from '../utils';
import type {
	SourceLocation,
	SvelteAttribute,
	SvelteDirective,
	SvelteGenericsDirective,
	SvelteShorthandAttribute,
	SvelteSpecialDirective,
	SvelteSpreadAttribute,
	SvelteStyleDirective
} from 'svelte-eslint-parser/lib/ast';
import type { AnyNode } from 'postcss';
import { default as selectorParser, type Node as SelectorNode } from 'postcss-selector-parser';
import { getSourceCode } from '../utils/compat';

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
		const classesUsedInTemplate: Record<string, SourceLocation> = {};

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
					styleContext.status === 'success' ? findClassesInPostCSSNode(styleContext.sourceAst) : [];
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
 * Extract all class names used in a HTML element attribute.
 */
function findClassesInAttribute(
	attribute:
		| SvelteAttribute
		| SvelteShorthandAttribute
		| SvelteSpreadAttribute
		| SvelteDirective
		| SvelteStyleDirective
		| SvelteSpecialDirective
		| SvelteGenericsDirective
): string[] {
	if (attribute.type === 'SvelteAttribute' && attribute.key.name === 'class') {
		return attribute.value.flatMap((value) =>
			value.type === 'SvelteLiteral' ? value.value.trim().split(/\s+/u) : []
		);
	}
	if (attribute.type === 'SvelteDirective' && attribute.kind === 'Class') {
		return [attribute.key.name.name];
	}
	return [];
}

/**
 * Extract all class names used in a PostCSS node.
 */
function findClassesInPostCSSNode(node: AnyNode): string[] {
	if (node.type === 'rule') {
		let classes = node.nodes.flatMap(findClassesInPostCSSNode);
		const processor = selectorParser();
		classes = classes.concat(findClassesInSelector(processor.astSync(node.selector)));
		return classes;
	}
	if ((node.type === 'root' || node.type === 'atrule') && node.nodes !== undefined) {
		return node.nodes.flatMap(findClassesInPostCSSNode);
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
