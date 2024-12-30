import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';
import { getSourceCode } from '../utils/compat.js';

export default createRule('no-trailing-spaces', {
	meta: {
		type: 'layout',
		docs: {
			description: 'disallow trailing whitespace at the end of lines',
			category: 'Extension Rules',
			recommended: false,
			extensionRule: 'no-trailing-spaces',
			conflictWithPrettier: true
		},
		fixable: 'whitespace',
		schema: [
			{
				type: 'object',
				properties: {
					skipBlankLines: { type: 'boolean' },
					ignoreComments: { type: 'boolean' }
				},
				additionalProperties: false
			}
		],
		messages: {
			trailingSpace: 'Trailing spaces not allowed.'
		}
	},
	create(context) {
		const options: { skipBlankLines?: boolean; ignoreComments?: boolean } | undefined =
			context.options[0];
		const skipBlankLines = options?.skipBlankLines || false;
		const ignoreComments = options?.ignoreComments || false;

		const sourceCode = getSourceCode(context);

		const ignoreLineNumbers = new Set<number>();
		if (ignoreComments) {
			for (const { type, loc } of sourceCode.getAllComments()) {
				const endLine = type === 'Block' ? loc.end.line - 1 : loc.end.line;
				for (let i = loc.start.line; i <= endLine; i++) {
					ignoreLineNumbers.add(i);
				}
			}
		}

		/**
		 * Reports a given location.
		 */
		function report(loc: AST.SourceLocation) {
			context.report({
				loc,
				messageId: 'trailingSpace',
				fix(fixer) {
					return fixer.removeRange([
						sourceCode.getIndexFromLoc(loc.start),
						sourceCode.getIndexFromLoc(loc.end)
					]);
				}
			});
		}

		/**
		 * Collects the location of the given node as the ignore line numbers.
		 */
		function collectIgnoreLineNumbers({ loc }: { loc: AST.SourceLocation }) {
			const endLine = loc.end.line - 1;
			for (let i = loc.start.line; i <= endLine; i++) {
				ignoreLineNumbers.add(i);
			}
		}

		return {
			TemplateElement: collectIgnoreLineNumbers,
			...(ignoreComments
				? {
						SvelteHTMLComment: collectIgnoreLineNumbers
					}
				: {}),
			'Program:exit'() {
				const lines = sourceCode.lines;
				for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
					const line = lines[lineIndex];
					if (skipBlankLines && !line.trim()) {
						continue;
					}
					const lineNumber = lineIndex + 1;
					if (ignoreLineNumbers.has(lineNumber)) {
						continue;
					}
					const trimmed = line.trimEnd();
					if (trimmed === line) {
						continue;
					}
					report({
						start: { line: lineNumber, column: trimmed.length },
						end: { line: lineNumber, column: line.length }
					});
				}
			}
		};
	}
});
