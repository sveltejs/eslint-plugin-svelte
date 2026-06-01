import { createRule } from '../utils/index.js';
import { getSvelteContext } from '../utils/svelte-context.js';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
import semver from 'semver';

const shouldRun = semver.satisfies(SVELTE_VERSION, '>=5.56.0');

export default createRule('no-at-const-tags', {
	meta: {
		docs: {
			description: 'disallow the use of `{@const}` in favor of `{const ...}` declaration tags',
			category: 'Best Practices',
			recommended: false
		},
		fixable: 'code',
		schema: [],
		messages: {
			unexpected: 'Use `{const ...}` declaration tag instead of legacy `{@const ...}`.'
		},
		type: 'suggestion',
		conditions: [
			{
				svelteVersions: ['5']
			}
		]
	},
	create(context) {
		if (!shouldRun) {
			return {};
		}
		const sourceCode = context.sourceCode;
		const runes = getSvelteContext(context)?.runes;
		// Only report and fix in runes mode, since preserving reactivity requires
		// `$derived(...)`, which is unavailable outside runes mode.
		if (runes !== true) {
			return {};
		}
		return {
			SvelteConstTag(node) {
				context.report({
					node,
					messageId: 'unexpected',
					*fix(fixer) {
						const text = sourceCode.getText(node);
						const match = /^\{(\s*)@const\b/u.exec(text);
						if (!match) {
							return;
						}
						const atOffset = node.range[0] + 1 + match[1].length;
						yield fixer.removeRange([atOffset, atOffset + 1]);

						const init = node.declarations[0].init;
						if (init == null) {
							return;
						}
						// Preserve the reactivity of legacy `{@const}` by wrapping the
						// initializer in `$derived(...)`. Skip when already wrapped.
						if (
							init.type === 'CallExpression' &&
							init.callee.type === 'Identifier' &&
							init.callee.name === '$derived'
						) {
							return;
						}
						yield fixer.insertTextBefore(init, '$derived(');
						yield fixer.insertTextAfter(init, ')');
					}
				});
			}
		};
	}
});
