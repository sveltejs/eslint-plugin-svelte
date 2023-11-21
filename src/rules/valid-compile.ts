import { createRule } from '../utils';
import type { Warning } from '../shared/svelte-compile-warns';
import { getSvelteCompileWarnings } from '../shared/svelte-compile-warns';
import { getSourceCode } from '../utils/compat';

export default createRule('valid-compile', {
	meta: {
		docs: {
			description: 'disallow warnings when compiling.',
			category: 'Possible Errors',
			recommended: true
		},
		schema: [
			{
				type: 'object',
				properties: {
					ignoreWarnings: { type: 'boolean' }
				},
				additionalProperties: false
			}
		],
		messages: {},
		type: 'problem'
	},
	create(context) {
		if (!getSourceCode(context).parserServices.isSvelte) {
			return {};
		}
		const ignoreWarnings = Boolean(context.options[0]?.ignoreWarnings);

		const ignores = [
			'missing-declaration',
			// Svelte v4
			'dynamic-slot-name',
			// Svelte v5
			'invalid-slot-name'
		];

		/**
		 * report
		 */
		function report(warnings: Warning[]) {
			for (const warn of warnings) {
				if (warn.code && ignores.includes(warn.code)) {
					continue;
				}
				context.report({
					loc: {
						start: warn.start || warn.end || { line: 1, column: 0 },
						end: warn.end || warn.start || { line: 1, column: 0 }
					},
					message: `${warn.message}${warn.code ? `(${warn.code})` : ''}`
				});
			}
		}

		return {
			'Program:exit'() {
				const result = getSvelteCompileWarnings(context);
				if (ignoreWarnings && result.kind === 'warn') {
					return;
				}
				report(result.warnings);
			}
		};
	}
});
