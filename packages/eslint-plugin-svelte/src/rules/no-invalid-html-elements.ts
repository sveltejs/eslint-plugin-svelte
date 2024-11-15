import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils';
import { getSourceCode } from '../utils/compat';

const INVALID_HTML_ELEMENTS = ['head', 'body', 'window', 'document', 'element', 'options'];
const VALID_PREFIX = 'svelte:';

export default createRule('no-invalid-html-elements', {
	meta: {
		docs: {
			description: 'Disallows valid Svelte 4 tags, that no are no longer valid in Svelte 5',
			category: 'Possible Errors',
			// TODO: Switch to recommended in the major version
			recommended: false
		},
		schema: [],
		messages: {
			invalidElement: 'Invalid {{name}} element, use svelte:{{name}} instead.'
		},
		type: 'problem', // 'problem', or 'layout',
		fixable: 'code'
	},
	create(context) {
		const sourceCode = getSourceCode(context);
		const ctx = sourceCode.parserServices.svelteParseContext;
		if (!(ctx?.compilerVersion ?? '').startsWith('5')) {
			// Only applies to Svelte 5
			return {};
		}

		return {
			'SvelteElement[kind="html"]'(node: AST.SvelteHTMLElement) {
				const { name } = node.name;
				if (INVALID_HTML_ELEMENTS.includes(name)) {
					context.report({
						node,
						messageId: 'invalidElement',
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
