import { createRule } from '../utils/index.js';
import { getSvelteContext } from '../utils/svelte-context.js';
import { getSvelteIgnoreItems } from '../shared/svelte-compile-warns/ignore-comment.js';

/**
 * Matches the kebab-case codes used before Svelte v5, e.g. `a11y-autofocus`.
 * Same as the pattern used by `migrate_svelte_ignore` in the Svelte compiler:
 * https://github.com/sveltejs/svelte/blob/70afafe18e48a9973c5f711d62d87d088234655e/packages/svelte/src/compiler/utils/extract_svelte_ignore.js#L96
 */
const LEGACY_CODE_PATTERN = /^\w+(?:-\w+)+$/u;

export default createRule('no-legacy-svelte-ignore', {
	meta: {
		docs: {
			description: 'disallow legacy kebab-case codes in svelte-ignore comments',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Use `{{newCode}}` instead of the legacy code `{{code}}`.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5'],
				svelteFileTypes: ['.svelte']
			}
		]
	},
	create(context) {
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const runes = getSvelteContext(context)?.runes === true;

		for (const item of getSvelteIgnoreItems(context)) {
			if (item.code == null || !LEGACY_CODE_PATTERN.test(item.code)) {
				continue;
			}
			if (runes && !item.readInRunesMode) {
				// In runes mode, Svelte reads the codes after the first one without a comma as prose.
				continue;
			}
			context.report({
				loc: {
					start: sourceCode.getLocFromIndex(item.range[0]),
					end: sourceCode.getLocFromIndex(item.range[1])
				},
				messageId: 'unexpected',
				data: { code: item.code, newCode: item.codeForV5 },
				fix(fixer) {
					return fixer.replaceTextRange(item.range, item.codeForV5);
				}
			});
		}
		return {};
	}
});
