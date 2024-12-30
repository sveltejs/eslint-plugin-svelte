import { getSvelteCompileWarnings } from '../shared/svelte-compile-warns/index.js';
import { createRule } from '../utils/index.js';
import type { IgnoreItem } from '../shared/svelte-compile-warns/ignore-comment.js';
import { getSvelteIgnoreItems } from '../shared/svelte-compile-warns/ignore-comment.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-unused-svelte-ignore', {
	meta: {
		docs: {
			description: 'disallow unused svelte-ignore comments',
			category: 'Best Practices',
			recommended: true
		},
		schema: [],
		messages: {
			unused: 'svelte-ignore comment is used, but not warned',
			missingCode: 'svelte-ignore comment must include the code'
		},
		type: 'suggestion'
	},

	create(context) {
		const sourceCode = getSourceCode(context);
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}

		const ignoreComments: IgnoreItem[] = [];
		for (const item of getSvelteIgnoreItems(context)) {
			if (item.code == null) {
				context.report({
					node: item.token,
					messageId: 'missingCode'
				});
			} else {
				ignoreComments.push(item);
			}
		}

		if (!ignoreComments.length) {
			return {};
		}

		const warnings = getSvelteCompileWarnings(context);
		if (warnings.kind === 'error') {
			return {};
		}

		for (const unused of warnings.unusedIgnores) {
			context.report({
				loc: {
					start: sourceCode.getLocFromIndex(unused.range[0]),
					end: sourceCode.getLocFromIndex(unused.range[1])
				},
				messageId: 'unused'
			});
		}
		return {};
	}
});
