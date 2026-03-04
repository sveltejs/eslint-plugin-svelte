import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

/**
 * Check whether a line of source text is blank (whitespace-only).
 */
function isBlankLine(text: string): boolean {
	return text.trim().length === 0;
}

/**
 * Check whether a line of source text appears to be a comment line.
 *
 * Covers JS/TS single-line comments (`//`), block comment delimiters and
 * continuation lines, HTML/Svelte comments (`<!-- -->`),
 * and CSS comments (same block-comment syntax).
 *
 * This is intentionally a heuristic — matching ESLint core `max-lines`
 * behaviour, which also uses a line-based heuristic rather than AST analysis
 * for comment detection.
 */
function isCommentLine(text: string): boolean {
	const trimmed = text.trim();
	return (
		trimmed.startsWith('//') ||
		trimmed.startsWith('/*') ||
		trimmed.startsWith('*') ||
		trimmed.startsWith('*/') ||
		trimmed.startsWith('<!--') ||
		trimmed.endsWith('-->')
	);
}

/**
 * Count the inner content lines of a block node (excluding opening/closing
 * tag lines), optionally skipping blank lines and comment lines.
 */
function countInnerLines(
	sourceLines: string[],
	startLine: number,
	endLine: number,
	skipBlankLines: boolean,
	skipComments: boolean
): number {
	// Single-line or empty block: <style></style> or <style>\n</style>
	if (endLine - startLine <= 1) {
		return 0;
	}

	let count = 0;
	// Iterate over inner lines only (exclude opening/closing tag lines)
	for (let i = startLine + 1; i < endLine; i++) {
		const lineText = sourceLines[i - 1]; // sourceLines is 0-indexed, lines are 1-indexed
		if (skipBlankLines && isBlankLine(lineText)) {
			continue;
		}
		if (skipComments && isCommentLine(lineText)) {
			continue;
		}
		count++;
	}

	return count;
}

export default createRule('max-lines-per-block', {
	meta: {
		docs: {
			description: 'enforce maximum number of lines in svelte component blocks',
			category: 'Best Practices',
			recommended: false
		},
		schema: [
			{
				type: 'object',
				properties: {
					script: {
						type: 'integer',
						minimum: 1
					},
					template: {
						type: 'integer',
						minimum: 1
					},
					style: {
						type: 'integer',
						minimum: 1
					},
					skipBlankLines: {
						type: 'boolean'
					},
					skipComments: {
						type: 'boolean'
					}
				},
				additionalProperties: false
			}
		],
		messages: {
			tooManyLines:
				'{{block}} block has too many lines ({{lineCount}}). Maximum allowed is {{max}}.'
		},
		type: 'suggestion'
	},
	create(context) {
		const options = context.options[0] ?? {};
		const scriptMax: number | undefined = options.script;
		const templateMax: number | undefined = options.template;
		const styleMax: number | undefined = options.style;
		const skipBlankLines: boolean = options.skipBlankLines ?? false;
		const skipComments: boolean = options.skipComments ?? false;

		const sourceCode = context.sourceCode;

		return {
			SvelteScriptElement(node: AST.SvelteScriptElement) {
				if (scriptMax == null) {
					return;
				}

				const lineCount = countInnerLines(
					sourceCode.lines,
					node.loc.start.line,
					node.loc.end.line,
					skipBlankLines,
					skipComments
				);

				if (lineCount > scriptMax) {
					context.report({
						node,
						messageId: 'tooManyLines',
						data: {
							block: '<script>',
							lineCount: String(lineCount),
							max: String(scriptMax)
						}
					});
				}
			},

			SvelteStyleElement(node: AST.SvelteStyleElement) {
				if (styleMax == null) {
					return;
				}

				const lineCount = countInnerLines(
					sourceCode.lines,
					node.loc.start.line,
					node.loc.end.line,
					skipBlankLines,
					skipComments
				);

				if (lineCount > styleMax) {
					context.report({
						node,
						messageId: 'tooManyLines',
						data: {
							block: '<style>',
							lineCount: String(lineCount),
							max: String(styleMax)
						}
					});
				}
			},

			'Program:exit'(program: AST.SvelteProgram) {
				if (templateMax == null) {
					return;
				}

				const totalLines = sourceCode.lines.length;

				// Collect line ranges occupied by <script> and <style> blocks
				const excludedLines = new Set<number>();
				for (const child of program.body) {
					if (
						child.type === 'SvelteScriptElement' ||
						child.type === 'SvelteStyleElement'
					) {
						for (let i = child.loc.start.line; i <= child.loc.end.line; i++) {
							excludedLines.add(i);
						}
					}
				}

				// Count template lines (everything not inside script/style blocks)
				let templateLineCount = 0;
				for (let i = 1; i <= totalLines; i++) {
					if (excludedLines.has(i)) {
						continue;
					}
					const lineText = sourceCode.lines[i - 1];
					if (skipBlankLines && isBlankLine(lineText)) {
						continue;
					}
					if (skipComments && isCommentLine(lineText)) {
						continue;
					}
					templateLineCount++;
				}

				if (templateLineCount > templateMax) {
					// Report on the first template node for meaningful location
					const firstTemplateNode = program.body.find(
						(
							child
						): child is Exclude<
							(typeof program.body)[number],
							AST.SvelteScriptElement | AST.SvelteStyleElement
						> =>
							child.type !== 'SvelteScriptElement' &&
							child.type !== 'SvelteStyleElement'
					);
					if (firstTemplateNode) {
						context.report({
							node: firstTemplateNode,
							messageId: 'tooManyLines',
							data: {
								block: 'template',
								lineCount: String(templateLineCount),
								max: String(templateMax)
							}
						});
					}
				}
			}
		};
	}
});
