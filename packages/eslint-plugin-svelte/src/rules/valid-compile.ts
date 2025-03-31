import { createRule } from '../utils/index.js';
import type { SvelteCompileWarnings, Warning } from '../shared/svelte-compile-warns/index.js';
import { getSvelteCompileWarnings } from '../shared/svelte-compile-warns/index.js';
import type { Position } from 'svelte-eslint-parser/lib/ast/common.js';

const ignores: string[] = ['missing-declaration'] as const;

const unusedSelectorWarnings: string[] = ['css_unused_selector', 'css-unused-selector'] as const;

function isGlobalStyleNode(
	globalStyleRanges: [Position, Position][],
	start?: Position,
	end?: Position
) {
	if (start == null || end == null) {
		return false;
	}
	return globalStyleRanges.some(([rangeStart, rangeEnd]) => {
		return (
			(rangeStart.line < start.line ||
				(rangeStart.line === start.line && rangeStart.column <= start.column)) &&
			(end.line < rangeEnd.line || (end.line === rangeEnd.line && end.column <= rangeEnd.column))
		);
	});
}

export default createRule('valid-compile', {
	meta: {
		docs: {
			description: 'disallow warnings when compiling.',
			category: 'Possible Errors',
			recommended: false
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
		const sourceCode = context.sourceCode;
		if (!sourceCode.parserServices.isSvelte) {
			return {};
		}
		const { onwarn, warningFilter } =
			sourceCode.parserServices.svelteParseContext?.svelteConfig ?? {};

		const transform: (warning: Warning) => Warning | null = warningFilter
			? (warning) => {
					if (!warning.code) return warning;
					return warningFilter(warning) ? warning : null;
				}
			: onwarn
				? (warning) => {
						if (!warning.code) return warning;
						let result: Warning | null = null;
						onwarn(warning, (reportWarn) => (result = reportWarn));
						return result;
					}
				: (warning) => warning;

		const ignoreWarnings = Boolean(context.options[0]?.ignoreWarnings);
		const globalStyleRanges: [Position, Position][] = [];

		/**
		 * report
		 */
		function report({ warnings, kind }: SvelteCompileWarnings) {
			for (const warn of warnings) {
				if (
					warn.code &&
					(ignores.includes(warn.code) ||
						(isGlobalStyleNode(globalStyleRanges, warn.start, warn.end) &&
							unusedSelectorWarnings.includes(warn.code)))
				) {
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
			SvelteStyleElement(node) {
				const { attributes } = node.startTag;
				for (const attr of attributes) {
					if (attr.type === 'SvelteAttribute' && attr.key.name === 'global') {
						globalStyleRanges.push([node.loc.start, node.loc.end]);
						break;
					}
				}
			},
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
