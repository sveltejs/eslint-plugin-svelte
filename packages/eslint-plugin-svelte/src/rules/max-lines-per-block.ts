import type { AST } from 'svelte-eslint-parser';
import { createRule } from '../utils/index.js';

/** Collect 1-indexed line numbers occupied by CSS block comments within a range. */
function collectCssCommentLines(
	sourceLines: string[],
	startLine: number,
	endLine: number
): Set<number> {
	const lines = new Set<number>();
	let inComment = false;

	for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
		const line = sourceLines[lineNum - 1];
		let hasCode = false;
		let col = 0;

		while (col < line.length) {
			if (inComment) {
				const closeIdx = line.indexOf('*/', col);
				if (closeIdx === -1) break;
				inComment = false;
				col = closeIdx + 2;
			} else {
				const openIdx = line.indexOf('/*', col);
				if (openIdx === -1) {
					if (line.substring(col).trim()) hasCode = true;
					break;
				}
				if (line.substring(col, openIdx).trim()) hasCode = true;
				inComment = true;
				col = openIdx + 2;
			}
		}

		if (!hasCode) lines.add(lineNum);
	}

	return lines;
}

/**
 * Count inner content lines of a block (excluding opening/closing tag lines),
 * optionally skipping blank lines and lines identified as comments.
 */
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

/** Collect 1-indexed line numbers covered by AST comment nodes within a range. */
function collectAstCommentLines(
	comments: AST.Comment[],
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
			lines.add(i);
		}
	}
	return lines;
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

				// Collect comment lines for template region
				const commentLines = new Set<number>();
				if (skipComments) {
					for (const node of htmlCommentNodes) {
						for (let i = node.loc.start.line; i <= node.loc.end.line; i++) {
							if (!excludedLines.has(i)) commentLines.add(i);
						}
					}
					for (const comment of sourceCode.getAllComments()) {
						for (let i = comment.loc.start.line; i <= comment.loc.end.line; i++) {
							if (!excludedLines.has(i)) commentLines.add(i);
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
