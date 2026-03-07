import type { AST } from 'svelte-eslint-parser';
import { Input } from 'postcss';
import tokenize from 'postcss/lib/tokenize';
import { createRule } from '../utils/index.js';

/** Check if a comment occupies the entire source line (matching ESLint core max-lines behavior). */
function isFullLineComment(line: string, lineNumber: number, loc: AST.SourceLocation): boolean {
	return (
		(loc.start.line < lineNumber || !line.slice(0, loc.start.column).trim()) &&
		(loc.end.line > lineNumber || !line.slice(loc.end.column).trim())
	);
}

/** Collect line numbers where AST comments occupy the full line. */
function collectAstCommentLines(
	comments: Array<{ loc: AST.SourceLocation }>,
	sourceLines: string[],
	startLine: number,
	endLine: number
): Set<number> {
	const lines = new Set<number>();
	for (const comment of comments) {
		if (comment.loc.end.line < startLine || comment.loc.start.line > endLine) continue;
		for (
			let i = Math.max(comment.loc.start.line, startLine);
			i <= Math.min(comment.loc.end.line, endLine);
			i++
		) {
			if (isFullLineComment(sourceLines[i - 1], i, comment.loc)) {
				lines.add(i);
			}
		}
	}
	return lines;
}

/** Collect line numbers where CSS comments occupy the full line, using postcss tokenizer. */
function collectCssCommentLines(
	sourceLines: string[],
	startLine: number,
	endLine: number
): Set<number> {
	const result = new Set<number>();
	const cssText = sourceLines.slice(startLine - 1, endLine).join('\n');
	if (!cssText.trim()) return result;

	try {
		const input = new Input(cssText);
		const tk = tokenize(input);
		const commentLines = new Set<number>();
		const codeLines = new Set<number>();

		let token;
		while ((token = tk.nextToken())) {
			if (token[2] == null) continue;
			const startPos = input.fromOffset(token[2]);
			if (!startPos) continue;
			const tokenLine = startPos.line + startLine - 1;

			if (token[0] === 'comment') {
				const endPos = token[3] != null ? input.fromOffset(token[3]) : null;
				const commentEndLine = endPos ? endPos.line + startLine - 1 : tokenLine;
				for (let i = tokenLine; i <= commentEndLine; i++) {
					commentLines.add(i);
				}
			} else {
				codeLines.add(tokenLine);
			}
		}

		for (const line of commentLines) {
			if (!codeLines.has(line)) result.add(line);
		}
	} catch {
		// Malformed CSS — don't skip any lines
	}

	return result;
}

/** Count inner content lines, skipping blanks and/or comment lines. */
function countLines(
	sourceLines: string[],
	startLine: number,
	endLine: number,
	skipBlankLines: boolean,
	commentLines: Set<number>
): number {
	if (endLine - startLine <= 1) return 0;

	let count = 0;
	for (let i = startLine + 1; i < endLine; i++) {
		if (skipBlankLines && sourceLines[i - 1].trim().length === 0) continue;
		if (commentLines.has(i)) continue;
		count++;
	}

	return count;
}

function isSvelteOptions(node: AST.SvelteElement): boolean {
	return node.name.type === 'SvelteName' && node.name.name === 'svelte:options';
}

export default createRule('max-lines-per-block', {
	meta: {
		docs: {
			description: 'enforce maximum number of lines in svelte component blocks',
			category: 'Stylistic Issues',
			recommended: false,
			conflictWithPrettier: false
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
		const htmlCommentNodes: AST.SvelteHTMLComment[] = [];
		const emptySet = new Set<number>();

		return {
			SvelteHTMLComment(node: AST.SvelteHTMLComment) {
				htmlCommentNodes.push(node);
			},

			SvelteScriptElement(node: AST.SvelteScriptElement) {
				if (scriptMax == null) return;

				const commentLines = skipComments
					? collectAstCommentLines(
							sourceCode.getAllComments(),
							sourceCode.lines,
							node.loc.start.line + 1,
							node.loc.end.line - 1
						)
					: emptySet;

				const lineCount = countLines(
					sourceCode.lines,
					node.loc.start.line,
					node.loc.end.line,
					skipBlankLines,
					commentLines
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
				if (styleMax == null) return;

				const commentLines = skipComments
					? collectCssCommentLines(sourceCode.lines, node.loc.start.line + 1, node.loc.end.line - 1)
					: emptySet;

				const lineCount = countLines(
					sourceCode.lines,
					node.loc.start.line,
					node.loc.end.line,
					skipBlankLines,
					commentLines
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
				if (templateMax == null) return;

				const totalLines = sourceCode.lines.length;

				// Exclude lines occupied by <script>, <style>, and <svelte:options>
				const excludedLines = new Set<number>();
				for (const child of program.body) {
					if (
						child.type === 'SvelteScriptElement' ||
						child.type === 'SvelteStyleElement' ||
						(child.type === 'SvelteElement' && isSvelteOptions(child))
					) {
						for (let i = child.loc.start.line; i <= child.loc.end.line; i++) {
							excludedLines.add(i);
						}
					}
				}

				// Collect full-line comment lines for template region
				const commentLines = new Set<number>();
				if (skipComments) {
					const allComments: Array<{ loc: AST.SourceLocation }> = [
						...htmlCommentNodes,
						...sourceCode.getAllComments()
					];
					for (const comment of allComments) {
						for (let i = comment.loc.start.line; i <= comment.loc.end.line; i++) {
							if (excludedLines.has(i)) continue;
							if (isFullLineComment(sourceCode.lines[i - 1], i, comment.loc)) {
								commentLines.add(i);
							}
						}
					}
				}

				let templateLineCount = 0;
				for (let i = 1; i <= totalLines; i++) {
					if (excludedLines.has(i)) continue;
					if (skipBlankLines && sourceCode.lines[i - 1].trim().length === 0) continue;
					if (commentLines.has(i)) continue;
					templateLineCount++;
				}

				if (templateLineCount > templateMax) {
					const firstTemplateNode = program.body.find(
						(
							child
						): child is Exclude<
							(typeof program.body)[number],
							AST.SvelteScriptElement | AST.SvelteStyleElement
						> =>
							child.type !== 'SvelteScriptElement' &&
							child.type !== 'SvelteStyleElement' &&
							!(child.type === 'SvelteElement' && isSvelteOptions(child))
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
