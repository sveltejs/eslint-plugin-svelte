import type { AST } from 'svelte-eslint-parser';
import type { ASTNode } from '../../types.js';
import type { SvelteNodeListener } from '../../types-for-node.js';
import { isNotWhitespace } from './ast.js';
import type { IndentContext } from './commons.js';
import { isBeginningOfElement } from './commons.js';
import { isBeginningOfLine } from './commons.js';
import { getFirstAndLastTokens } from './commons.js';
import { isClosingParenToken, isOpeningParenToken } from '@eslint-community/eslint-utils';

type NodeListener = SvelteNodeListener;
const PREFORMATTED_ELEMENT_NAMES = ['pre', 'textarea', 'template'];

/**
 * Creates AST event handlers for svelte nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener {
	const { sourceCode, offsets, options } = context;
	const visitor = {
		// ----------------------------------------------------------------------
		// ELEMENTS
		// ----------------------------------------------------------------------
		SvelteScriptElement(node: AST.SvelteScriptElement) {
			offsets.setOffsetElementList(
				node.body,
				node.startTag,
				node.endTag,
				options.indentScript ? 1 : 0
			);
		},
		SvelteStyleElement(node: AST.SvelteStyleElement) {
			node.children.forEach((n) => offsets.ignore(n));
		},
		SvelteElement(node: AST.SvelteElement) {
			if (node.name.type === 'Identifier' || node.name.type === 'SvelteName') {
				if (PREFORMATTED_ELEMENT_NAMES.includes(node.name.name)) {
					const startTagToken = sourceCode.getFirstToken(node);
					const endTagToken = node.endTag && sourceCode.getFirstToken(node.endTag);
					offsets.setOffsetToken(endTagToken, 0, startTagToken);
					node.children.forEach((n) => offsets.ignore(n));
					return;
				}
				if (node.name.name === 'style') {
					// Inline style tag
					node.children.forEach((n) => offsets.ignore(n));
					return;
				}
			}
			if (node.endTag) {
				offsets.setOffsetElementList(
					node.children.filter(isNotEmptyTextNode),
					node.startTag,
					node.endTag,
					1
				);
			}
		},
		// ----------------------------------------------------------------------
		// TAGS
		// ----------------------------------------------------------------------
		SvelteStartTag(node: AST.SvelteStartTag) {
			const openToken = sourceCode.getFirstToken(node);
			const closeToken = sourceCode.getLastToken(node);

			offsets.setOffsetElementList(
				node.attributes,
				openToken,
				closeToken,
				1,
				options.alignAttributesVertically
			);
			if (node.selfClosing) {
				const slash = sourceCode.getTokenBefore(closeToken)!;
				if (slash.value === '/') {
					offsets.setOffsetToken(slash, 0, openToken);
				}
			}
		},
		SvelteEndTag(node: AST.SvelteEndTag) {
			const openToken = sourceCode.getFirstToken(node);
			const closeToken = sourceCode.getLastToken(node);
			offsets.setOffsetElementList([], openToken, closeToken, 1);
		},
		// ----------------------------------------------------------------------
		// ATTRIBUTES
		// ----------------------------------------------------------------------
		SvelteAttribute(
			node:
				| AST.SvelteAttribute
				| AST.SvelteDirective
				| AST.SvelteStyleDirective
				| AST.SvelteSpecialDirective
		) {
			const keyToken = sourceCode.getFirstToken(node);
			const eqToken = sourceCode.getTokenAfter(node.key);

			if (eqToken != null && eqToken.range[1] <= node.range[1]) {
				offsets.setOffsetToken(eqToken, 1, keyToken);

				const valueStartToken = sourceCode.getTokenAfter(eqToken);
				if (valueStartToken != null && valueStartToken.range[1] <= node.range[1]) {
					offsets.setOffsetToken(valueStartToken, 1, keyToken);

					const values =
						node.type === 'SvelteAttribute' || node.type === 'SvelteStyleDirective'
							? node.value
							: [];
					// process quoted
					let processedValues = false;
					if (valueStartToken.type === 'Punctuator') {
						const quoted = ['"', "'"].includes(valueStartToken.value);
						const mustache = !quoted && valueStartToken.value === '{';
						if (quoted || mustache) {
							const last = sourceCode.getLastToken(node);
							if (
								last.type === 'Punctuator' &&
								((quoted && last.value === valueStartToken.value) ||
									(mustache && last.value === '}'))
							) {
								offsets.setOffsetToken(last, 0, valueStartToken);

								offsets.setOffsetElementList(values, valueStartToken, last, 1);
								processedValues = true;
							}
						}
					}
					if (!processedValues) {
						for (const val of values) {
							const token = sourceCode.getFirstToken(val);
							offsets.setOffsetToken(token, 0, valueStartToken);
						}
					}
				}
			}
		},
		SvelteDirective(node: AST.SvelteDirective) {
			visitor.SvelteAttribute(node);
		},
		SvelteStyleDirective(node: AST.SvelteStyleDirective) {
			visitor.SvelteAttribute(node);
		},
		SvelteSpecialDirective(node: AST.SvelteSpecialDirective) {
			visitor.SvelteAttribute(node);
		},
		SvelteShorthandAttribute(node: AST.SvelteShorthandAttribute | AST.SvelteSpreadAttribute) {
			const openToken = sourceCode.getFirstToken(node);
			const closeToken = sourceCode.getLastToken(node);
			offsets.setOffsetElementList([], openToken, closeToken, 1);
		},
		SvelteSpreadAttribute(node: AST.SvelteSpreadAttribute) {
			visitor.SvelteShorthandAttribute(node);
		},
		// ----------------------------------------------------------------------
		// ATTRIBUTE KEYS
		// ----------------------------------------------------------------------
		SvelteDirectiveKey(_node: AST.SvelteDirectiveKey) {
			// noop
		},
		SvelteSpecialDirectiveKey(_node: AST.SvelteSpecialDirectiveKey) {
			// noop
		},
		// ----------------------------------------------------------------------
		// CONTENTS
		// ----------------------------------------------------------------------
		SvelteText(node: AST.SvelteText) {
			const tokens = sourceCode.getTokens(node, {
				filter: isNotWhitespace,
				includeComments: false
			});
			const first = tokens.shift();
			if (!first) {
				return;
			}
			offsets.setOffsetToken(
				tokens,
				isBeginningOfLine(sourceCode, first) ? 0 : isBeginningOfElement(node) ? 1 : 0,
				first
			);
		},
		SvelteLiteral(node: AST.SvelteLiteral) {
			const tokens = sourceCode.getTokens(node, {
				filter: isNotWhitespace,
				includeComments: false
			});
			const first = tokens.shift();
			if (!first) {
				return;
			}
			offsets.setOffsetToken(tokens, isBeginningOfLine(sourceCode, first) ? 0 : 1, first);
		},
		// ----------------------------------------------------------------------
		// MUSTACHE TAGS
		// ----------------------------------------------------------------------
		SvelteMustacheTag(node: AST.SvelteMustacheTag) {
			const openToken = sourceCode.getFirstToken(node);
			const closeToken = sourceCode.getLastToken(node);
			offsets.setOffsetElementList([node.expression], openToken, closeToken, 1);
		},
		SvelteDebugTag(node: AST.SvelteDebugTag) {
			const openToken = sourceCode.getFirstToken(node);
			const closeToken = sourceCode.getLastToken(node);
			offsets.setOffsetElementList(node.identifiers, openToken, closeToken, 1);
		},
		SvelteConstTag(node: AST.SvelteConstTag) {
			const openToken = sourceCode.getFirstToken(node);
			const constToken = sourceCode.getTokenAfter(openToken);
			const declarationToken = sourceCode.getFirstToken(node.declaration);
			const closeToken = sourceCode.getLastToken(node);
			offsets.setOffsetToken(constToken, 1, openToken);
			offsets.setOffsetToken(declarationToken, 1, openToken);
			offsets.setOffsetToken(closeToken, 0, openToken);
		},
		SvelteRenderTag(node: AST.SvelteRenderTag) {
			const openToken = sourceCode.getFirstToken(node);
			const renderToken = sourceCode.getTokenAfter(openToken)!;
			offsets.setOffsetToken(renderToken, 1, openToken);
			offsets.setOffsetToken(node.expression, 1, renderToken);
		},
		// ----------------------------------------------------------------------
		// BLOCKS
		// ----------------------------------------------------------------------
		SvelteIfBlock(node: AST.SvelteIfBlock) {
			const [openToken, ...ifTokens] = sourceCode.getFirstTokens(node, {
				count: node.elseif ? 3 : 2,
				includeComments: false
			});
			offsets.setOffsetToken(ifTokens, 1, openToken);
			const exp = getFirstAndLastTokens(sourceCode, node.expression);
			offsets.setOffsetToken(exp.firstToken, 1, ifTokens[0]);

			const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken);
			offsets.setOffsetToken(closeOpenTagToken, 0, openToken);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}

			if (node.else) {
				offsets.setOffsetToken(sourceCode.getFirstToken(node.else), 0, openToken);
				if (node.else.elseif) {
					// else if
					return;
				}
			}
			const [openCloseTagToken, endIfToken, closeCloseTagToken] = sourceCode.getLastTokens(node, {
				count: 3,
				includeComments: false
			});
			offsets.setOffsetToken(openCloseTagToken, 0, openToken);
			offsets.setOffsetToken(endIfToken, 1, openCloseTagToken);
			offsets.setOffsetToken(closeCloseTagToken, 0, openCloseTagToken);
		},
		SvelteElseBlock(node: AST.SvelteElseBlock) {
			if (node.elseif) {
				return;
			}
			const [openToken, elseToken, closeToken] = sourceCode.getFirstTokens(node, {
				count: 3,
				includeComments: false
			});
			offsets.setOffsetToken(elseToken, 1, openToken);
			offsets.setOffsetToken(closeToken, 0, openToken);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}
		},
		SvelteEachBlock(node: AST.SvelteEachBlock) {
			const [openToken, eachToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			offsets.setOffsetToken(eachToken, 1, openToken);
			offsets.setOffsetElementList([node.expression, node.context, node.index], eachToken, null, 1);
			if (node.key) {
				const key = getFirstAndLastTokens(sourceCode, node.key);
				offsets.setOffsetToken(key.firstToken, 1, eachToken);
				const closeOpenTagToken = sourceCode.getTokenAfter(key.lastToken);
				offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
			} else {
				const closeOpenTagToken = sourceCode.getTokenAfter(
					node.index || node.context || node.expression
				);
				offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
			}

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}
			if (node.else) {
				offsets.setOffsetToken(sourceCode.getFirstToken(node.else), 0, openToken);
			}

			const [openCloseTagToken, endEachToken, closeCloseTagToken] = sourceCode.getLastTokens(node, {
				count: 3,
				includeComments: false
			});
			offsets.setOffsetToken(openCloseTagToken, 0, openToken);
			offsets.setOffsetToken(endEachToken, 1, openCloseTagToken);
			offsets.setOffsetToken(closeCloseTagToken, 0, openCloseTagToken);
		},
		SvelteAwaitBlock(node: AST.SvelteAwaitBlock) {
			const [openToken, awaitToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			offsets.setOffsetToken(awaitToken, 1, openToken);
			const exp = getFirstAndLastTokens(sourceCode, node.expression);
			offsets.setOffsetToken(exp.firstToken, 1, awaitToken);

			if (node.pending) {
				const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken);
				offsets.setOffsetToken(closeOpenTagToken, 0, openToken);

				offsets.setOffsetToken(
					sourceCode.getFirstToken(node.pending, {
						includeComments: false,
						filter: isNotWhitespace
					}),
					1,
					openToken
				);
			}

			if (node.then) {
				if (node.kind === 'await-then') {
					// {#await expression then value}
					const thenToken = sourceCode.getTokenAfter(exp.lastToken)!;
					offsets.setOffsetToken(thenToken, 1, openToken);
					if (node.then.value) {
						offsets.setOffsetToken(sourceCode.getFirstToken(node.then.value), 1, thenToken);
					}
					const closeOpenTagToken = sourceCode.getTokenAfter(node.then.value || thenToken);
					offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
				} else {
					// {:then value}
					offsets.setOffsetToken(sourceCode.getFirstToken(node.then), 0, openToken);
				}
			}
			if (node.catch) {
				if (node.kind === 'await-catch') {
					// {#await expression catch error}
					const catchToken = sourceCode.getTokenAfter(exp.lastToken)!;
					offsets.setOffsetToken(catchToken, 1, openToken);
					if (node.catch.error) {
						offsets.setOffsetToken(sourceCode.getFirstToken(node.catch.error), 1, catchToken);
					}
					const closeOpenTagToken = sourceCode.getTokenAfter(node.catch.error || catchToken);
					offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
				} else {
					// {:catch value}
					offsets.setOffsetToken(sourceCode.getFirstToken(node.catch), 0, openToken);
				}
			}

			const [openCloseTagToken, endAwaitToken, closeCloseTagToken] = sourceCode.getLastTokens(
				node,
				{
					count: 3,
					includeComments: false
				}
			);
			offsets.setOffsetToken(openCloseTagToken, 0, openToken);
			offsets.setOffsetToken(endAwaitToken, 1, openCloseTagToken);
			offsets.setOffsetToken(closeCloseTagToken, 0, openCloseTagToken);
		},
		SvelteAwaitPendingBlock(node: AST.SvelteAwaitPendingBlock) {
			const openToken = sourceCode.getFirstToken(node);
			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}
		},
		SvelteAwaitThenBlock(node: AST.SvelteAwaitThenBlock) {
			if (!node.awaitThen) {
				// {:then value}
				const [openToken, thenToken] = sourceCode.getFirstTokens(node, {
					count: 2,
					includeComments: false
				});
				offsets.setOffsetToken(thenToken, 1, openToken);
				if (node.value) {
					const valueToken = sourceCode.getFirstToken(node.value);
					offsets.setOffsetToken(valueToken, 1, thenToken);
				}
				const closeOpenTagToken = sourceCode.getTokenAfter(node.value || thenToken);
				offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
			}
			const openToken = sourceCode.getFirstToken(node);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}
		},
		SvelteAwaitCatchBlock(node: AST.SvelteAwaitCatchBlock) {
			if (!node.awaitCatch) {
				// {:catch error}
				const [openToken, catchToken] = sourceCode.getFirstTokens(node, {
					count: 2,
					includeComments: false
				});
				offsets.setOffsetToken(catchToken, 1, openToken);
				if (node.error) {
					const errorToken = sourceCode.getFirstToken(node.error);
					offsets.setOffsetToken(errorToken, 1, catchToken);
				}
				const closeOpenTagToken = sourceCode.getTokenAfter(node.error || catchToken);
				offsets.setOffsetToken(closeOpenTagToken, 0, openToken);
			}
			const openToken = sourceCode.getFirstToken(node);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}
		},
		SvelteKeyBlock(node: AST.SvelteKeyBlock) {
			const [openToken, keyToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			offsets.setOffsetToken(keyToken, 1, openToken);
			const exp = getFirstAndLastTokens(sourceCode, node.expression);
			offsets.setOffsetToken(exp.firstToken, 1, keyToken);

			const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken);
			offsets.setOffsetToken(closeOpenTagToken, 0, openToken);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}

			const [openCloseTagToken, endKeyToken, closeCloseTagToken] = sourceCode.getLastTokens(node, {
				count: 3,
				includeComments: false
			});
			offsets.setOffsetToken(openCloseTagToken, 0, openToken);
			offsets.setOffsetToken(endKeyToken, 1, openCloseTagToken);
			offsets.setOffsetToken(closeCloseTagToken, 0, openCloseTagToken);
		},
		SvelteSnippetBlock(node: AST.SvelteSnippetBlock) {
			const [openToken, snippetToken] = sourceCode.getFirstTokens(node, {
				count: 2,
				includeComments: false
			});
			offsets.setOffsetToken(snippetToken, 1, openToken);
			const snippetName = sourceCode.getTokenAfter(snippetToken)!;
			offsets.setOffsetToken(snippetName, 1, snippetToken);

			const leftParenToken = sourceCode.getTokenBefore(
				node.params[0] || sourceCode.getLastToken(node),
				{
					filter: isOpeningParenToken,
					includeComments: false
				}
			)!;

			const rightParenToken = sourceCode.getTokenAfter(
				node.params[node.params.length - 1] || leftParenToken,
				{
					filter: isClosingParenToken,
					includeComments: false
				}
			)!;
			offsets.setOffsetToken(leftParenToken, 1, snippetName);
			offsets.setOffsetElementList(node.params, leftParenToken, rightParenToken, 1);

			const closeOpenTagToken = sourceCode.getTokenAfter(rightParenToken)!;
			offsets.setOffsetToken(closeOpenTagToken, 0, openToken);

			for (const child of node.children) {
				const token = sourceCode.getFirstToken(child, {
					includeComments: false,
					filter: isNotWhitespace
				});
				offsets.setOffsetToken(token, 1, openToken);
			}

			const [openCloseTagToken, endSnippetToken, closeCloseTagToken] = sourceCode.getLastTokens(
				node,
				{ count: 3, includeComments: false }
			);
			offsets.setOffsetToken(openCloseTagToken, 0, openToken);
			offsets.setOffsetToken(endSnippetToken, 1, openCloseTagToken);
			offsets.setOffsetToken(closeCloseTagToken, 0, openCloseTagToken);
		},
		// ----------------------------------------------------------------------
		// COMMENTS
		// ----------------------------------------------------------------------
		SvelteHTMLComment(_node: AST.SvelteHTMLComment) {
			// noop
		},
		// ----------------------------------------------------------------------
		// NAMES
		// ----------------------------------------------------------------------
		SvelteName(_node: AST.SvelteName) {
			// noop
		},
		SvelteMemberExpressionName(_node: AST.SvelteMemberExpressionName) {
			// noop
		}
	};

	return visitor;
}

/**
 * Check whether the given node is not an empty text node.
 * @param node The node to check.
 * @returns `false` if the token is empty text node.
 */
function isNotEmptyTextNode(node: ASTNode) {
	return !(node.type === 'SvelteText' && node.value.trim() === '');
}
