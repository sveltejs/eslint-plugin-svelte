import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
import type { ASTNode, RuleContext, RuleListener } from '../../types.js';
import * as SV from './svelte.js';
import * as ES from './es.js';
import * as TS from './ts.js';
import { isNotWhitespace } from './ast.js';
import { isCommentToken } from '@eslint-community/eslint-utils';
import type { AnyToken, IndentOptions } from './commons.js';
import type { OffsetCalculator } from './offset-context.js';
import { OffsetContext } from './offset-context.js';
import { getFilename, getSourceCode } from '../../utils/compat.js';

type IndentUserOptions = {
	indent?: number | 'tab';
	indentScript?: boolean;
	switchCase?: number;
	alignAttributesVertically?: boolean;
	ignoredNodes?: string[];
};

/**
 * Normalize options.
 * @param type The type of indentation.
 * @param options Other options.
 * @param defaultOptions The default value of options.
 * @returns Normalized options.
 */
function parseOptions(
	options: IndentUserOptions,
	defaultOptions: Partial<IndentOptions>
): IndentOptions {
	const ret: IndentOptions = {
		indentChar: ' ',
		indentScript: true,
		indentSize: 2,
		switchCase: 1,
		alignAttributesVertically: false,
		ignoredNodes: [],
		...defaultOptions
	};

	if (Number.isSafeInteger(options.indent)) {
		ret.indentSize = Number(options.indent);
	} else if (options.indent === 'tab') {
		ret.indentChar = '\t';
		ret.indentSize = 1;
	}

	if (typeof options.indentScript === 'boolean') {
		ret.indentScript = options.indentScript;
	}

	if (options.switchCase != null && Number.isSafeInteger(options.switchCase)) {
		ret.switchCase = options.switchCase;
	}

	if (options.ignoredNodes != null) {
		ret.ignoredNodes = options.ignoredNodes;
	}

	if (options.alignAttributesVertically && ret.indentChar === ' ') {
		ret.alignAttributesVertically = true;
	} else if (ret.indentChar !== ' ') {
		ret.alignAttributesVertically = false;
	}

	return ret;
}

/**
 * Creates AST event handlers for html-indent.
 *
 * @param context The rule context.
 * @param defaultOptions The default value of options.
 * @returns AST event handlers.
 */
export function defineVisitor(
	context: RuleContext,
	defaultOptions: Partial<IndentOptions>
): RuleListener {
	if (!getFilename(context).endsWith('.svelte')) return {};

	const options = parseOptions(context.options[0] || {}, defaultOptions);
	const sourceCode = getSourceCode(context);
	const offsets = new OffsetContext({ sourceCode, options });

	/**
	 * Get the text of the indentation part of the given location.
	 */
	function getIndentText({ line, column }: { line: number; column: number }) {
		return sourceCode.lines[line - 1].slice(0, column);
	}

	/**
	 * Validate the given token with the pre-calculated expected indentation.
	 */
	function validateToken(token: AnyToken, expectedIndent: number) {
		const line = token.loc.start.line;
		const indentText = getIndentText(token.loc.start);

		// `indentText` contains non-whitespace characters.
		if (indentText.trim() !== '') {
			return;
		}

		const actualIndent = token.loc.start.column;

		const mismatchCharIndexes: number[] = [];
		for (let i = 0; i < indentText.length; ++i) {
			if (indentText[i] !== options.indentChar) {
				mismatchCharIndexes.push(i);
			}
		}
		if (actualIndent !== expectedIndent) {
			const loc = {
				start: { line, column: 0 },
				end: { line, column: actualIndent }
			};
			context.report({
				loc,
				messageId: 'unexpectedIndentation',
				data: {
					expectedIndent: String(expectedIndent),
					actualIndent: String(actualIndent),
					expectedUnit: options.indentChar === '\t' ? 'tab' : 'space',
					actualUnit: mismatchCharIndexes.length
						? 'whitespace'
						: options.indentChar === '\t'
							? 'tab'
							: 'space',
					expectedIndentPlural: expectedIndent === 1 ? '' : 's',
					actualIndentPlural: actualIndent === 1 ? '' : 's'
				},
				fix(fixer) {
					return fixer.replaceTextRange(
						[sourceCode.getIndexFromLoc(loc.start), sourceCode.getIndexFromLoc(loc.end)],
						options.indentChar.repeat(expectedIndent)
					);
				}
			});
			return;
		}

		for (const i of mismatchCharIndexes) {
			const loc = {
				start: { line, column: i },
				end: { line, column: i + 1 }
			};
			context.report({
				loc,
				messageId: 'unexpectedChar',
				data: {
					expected: JSON.stringify(options.indentChar),
					actual: JSON.stringify(indentText[i])
				},
				fix(fixer) {
					return fixer.replaceTextRange(
						[sourceCode.getIndexFromLoc(loc.start), sourceCode.getIndexFromLoc(loc.end)],
						options.indentChar
					);
				}
			});
		}
	}

	/** Process line tokens */
	function processLine(
		tokens: AnyToken[],
		prevComments: AST.Comment[],
		prevToken: AnyToken | null,
		calculator: OffsetCalculator
	) {
		const firstToken = tokens[0];
		const actualIndent = firstToken.loc.start.column;
		const expectedIndent = calculator.getExpectedIndentFromTokens(tokens);
		if (expectedIndent == null) {
			calculator.saveExpectedIndent(tokens, actualIndent);
			return;
		}
		calculator.saveExpectedIndent(
			tokens,
			Math.min(
				...tokens
					.map((t) => calculator.getExpectedIndentFromToken(t))
					.filter((i): i is number => i != null)
			)
		);

		let prev = prevToken;
		if (prevComments.length) {
			if (prev && prev.loc.end.line < prevComments[0].loc.start.line) {
				validateToken(prevComments[0], expectedIndent);
			}
			prev = prevComments[prevComments.length - 1];
		}
		if (prev && prev.loc.end.line < tokens[0].loc.start.line) {
			validateToken(tokens[0], expectedIndent);
		}
	}

	const indentContext = {
		sourceCode,
		options,
		offsets
	};
	const nodesVisitor = {
		...ES.defineVisitor(indentContext),
		...SV.defineVisitor(indentContext),
		...TS.defineVisitor(indentContext)
	};
	const knownNodes = new Set(Object.keys(nodesVisitor));

	/**
	 * Build a visitor combined with a visitor to handle the given ignore selector.
	 */
	function compositingIgnoresVisitor(visitor: RuleListener): RuleListener {
		for (const ignoreSelector of options.ignoredNodes) {
			const key = `${ignoreSelector}:exit`;

			if (visitor[key]) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
				const handler = visitor[key] as any;
				visitor[key] = function (node: never, ...args: never[]) {
					const ret = handler.call(this, node, ...args);
					offsets.ignore(node);
					return ret;
				};
			} else {
				visitor[key] = (node: never) => offsets.ignore(node);
			}
		}

		return visitor;
	}

	return compositingIgnoresVisitor({
		...nodesVisitor,
		'*:exit'(node: ASTNode) {
			// Ignore tokens of unknown nodes.
			if (!knownNodes.has(node.type)) {
				// debugger
				// console.log(node.type, node.loc!.start.line)
				offsets.ignore(node);
			}
		},
		'Program:exit'(node: TSESTree.Program) {
			const calculator = offsets.getOffsetCalculator();

			let prevToken: AnyToken | null = null;
			for (const { prevComments, tokens } of iterateLineTokens()) {
				processLine(tokens, prevComments, prevToken, calculator);
				prevToken = tokens[tokens.length - 1];
			}

			/** Iterate line tokens */
			function* iterateLineTokens() {
				let line = 0;
				let prevComments: AST.Comment[] = [];
				let bufferTokens: AnyToken[] = [];
				for (const token of sourceCode.getTokens(node, {
					includeComments: true,
					filter: isNotWhitespace
				})) {
					const thisLine = token.loc.start.line;
					if (line === thisLine || bufferTokens.length === 0) {
						bufferTokens.push(token);
					} else {
						if (isCommentToken(bufferTokens[0]) && bufferTokens.every(isCommentToken)) {
							prevComments.push(bufferTokens[0]);
						} else {
							yield {
								prevComments,
								tokens: bufferTokens
							};
							prevComments = [];
						}
						bufferTokens = [token];
					}
					line = thisLine;
				}
				if (bufferTokens.length && !bufferTokens.every(isCommentToken)) {
					yield {
						prevComments,
						tokens: bufferTokens
					};
				}
			}
		}
	});
}
