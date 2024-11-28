import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

/**
 * Check whether the component is declared in a single line or not.
 */
function isSingleLine(node: AST.SvelteStartTag) {
	return node.loc.start.line === node.loc.end.line;
}

/**
 * Group attributes line by line.
 */
function groupAttributesByLine(attributes: AST.SvelteStartTag['attributes']) {
	const group: AST.SvelteStartTag['attributes'][] = [];
	for (const attr of attributes) {
		if (group[0]?.[0]?.loc.end.line === attr.loc.start.line) {
			group[0].push(attr);
		} else {
			group.unshift([attr]);
		}
	}

	return group.reverse();
}

export default createRule('max-attributes-per-line', {
	meta: {
		docs: {
			description: 'enforce the maximum number of attributes per line',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: true
		},
		fixable: 'whitespace',
		schema: [
			{
				type: 'object',
				properties: {
					multiline: {
						type: 'number',
						minimum: 1
					},
					singleline: {
						type: 'number',
						minimum: 1
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			requireNewline: "'{{name}}' should be on a new line."
		},
		type: 'layout'
	},
	create(context) {
		const multilineMaximum = context.options[0]?.multiline ?? 1;
		const singlelineMaximum = context.options[0]?.singleline ?? 1;
		const sourceCode = getSourceCode(context);

		/**
		 * Report attributes
		 */
		function report(attribute: AST.SvelteStartTag['attributes'][number] | undefined) {
			if (!attribute) {
				return;
			}
			let name: string;
			if (
				attribute.type === 'SvelteAttribute' ||
				attribute.type === 'SvelteShorthandAttribute' ||
				attribute.type === 'SvelteDirective' ||
				attribute.type === 'SvelteStyleDirective' ||
				attribute.type === 'SvelteSpecialDirective'
			) {
				name = sourceCode.text.slice(...attribute.key.range);
			} else {
				// if (attribute.type === "SvelteSpreadAttribute")
				name = sourceCode.text.slice(...attribute.range);
			}
			context.report({
				node: attribute,
				loc: attribute.loc,
				messageId: 'requireNewline',
				data: { name },
				fix(fixer) {
					// Find the closest token before the current attribute
					// that is not a white space
					const prevToken = sourceCode.getTokenBefore(attribute, {
						includeComments: true
					})!;

					const range: AST.Range = [prevToken.range[1], attribute.range[0]];

					return fixer.replaceTextRange(range, '\n');
				}
			});
		}

		return {
			SvelteStartTag(node) {
				const numberOfAttributes = node.attributes.length;

				if (!numberOfAttributes) return;

				if (isSingleLine(node)) {
					if (numberOfAttributes > singlelineMaximum) {
						report(node.attributes[singlelineMaximum]);
					}
				} else {
					for (const attrs of groupAttributesByLine(node.attributes)) {
						report(attrs[multilineMaximum]);
					}
				}
			}
		};
	}
});
