import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

export default createRule('no-at-html-tags', {
	meta: {
		docs: {
			description: 'disallow use of `{@html}` to prevent XSS attack',
			category: 'Security Vulnerability',
			configNames: ['recommended', 'recommended_svelte5_without_legacy', 'recommended_svelte3_4']
		},
		schema: [],
		messages: {
			unexpected: '`{@html}` can lead to XSS attack.'
		},
		type: 'suggestion' // "problem",
	},
	create(context) {
		return {
			'SvelteMustacheTag[kind=raw]'(node: AST.SvelteMustacheTag) {
				context.report({
					node,
					messageId: 'unexpected'
				});
			}
		};
	}
});
