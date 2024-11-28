import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

const INVALID_HTML_ELEMENTS = ['head', 'body', 'window', 'document', 'element', 'options'];
const VALID_PREFIX = 'svelte:';

export default createRule('no-deprecated-raw-special-elements', {
	meta: {
		docs: {
			description: 'Recommends not using raw special elements in Svelte versions previous to 5.',
			category: 'Possible Errors',
			// TODO: Switch to recommended in the major version
			recommended: false
		},
		schema: [],
		messages: {
			deprecatedElement:
				'Special {{name}} element is deprecated in v5, use svelte:{{name}} instead.'
		},
		type: 'problem', // 'problem', or 'layout',
		fixable: 'code'
	},
	create(context) {
		return {
			'SvelteElement[kind="html"]'(node: AST.SvelteHTMLElement) {
				const { name } = node.name;
				if (INVALID_HTML_ELEMENTS.includes(name)) {
					context.report({
						node,
						messageId: 'deprecatedElement',
						data: { name },
						*fix(fixer) {
							const { endTag } = node;
							yield fixer.insertTextBeforeRange([node.range[0] + 1, node.range[1]], VALID_PREFIX);
							if (endTag) {
								yield fixer.insertTextBeforeRange(
									[endTag.range[0] + 2, endTag.range[1]],
									VALID_PREFIX
								);
							}
						}
					});
				}
			}
		};
	}
});
