import { createRule } from '../utils/index.js';
import type { SvelteCompileWarnings, Warning } from '../shared/svelte-compile-warns/index.js';
import { getSvelteCompileWarnings } from '../shared/svelte-compile-warns/index.js';
import { getSourceCode } from '../utils/compat.js';

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
		const sourceCode = getSourceCode(context);
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const onwarn = sourceCode.parserServices.svelteParseContext?.svelteConfig?.onwarn;

		const transform: (warning: Warning) => Warning | null = onwarn
			? (warning) => {
					if (!warning.code) return warning;
					let result: Warning | null = null;
					onwarn(warning, (reportWarn) => (result = reportWarn));
					return result;
				}
			: (warning) => warning;

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
		function report({ warnings, kind }: SvelteCompileWarnings) {
			for (const warn of warnings) {
				if (warn.code && ignores.includes(warn.code)) {
					continue;
				}
				const reportWarn = kind === 'warn' ? transform(warn) : warn;
				if (!reportWarn) {
					continue;
				}
				context.report({
					loc: {
						start: reportWarn.start || reportWarn.end || { line: 1, column: 0 },
						end: reportWarn.end || reportWarn.start || { line: 1, column: 0 }
					},
					message: `${reportWarn.message}${reportWarn.code ? `(${reportWarn.code})` : ''}`
				});
			}
		}

		return {
			'Program:exit'() {
				const result = getSvelteCompileWarnings(context);
				if (ignoreWarnings && result.kind === 'warn') {
					return;
				}
				report(result);
			}
		};
	}
});
