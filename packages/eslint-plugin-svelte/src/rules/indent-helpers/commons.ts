import type { ASTNode, SourceCode } from '../../types.js';
import type { AST } from 'svelte-eslint-parser';
import { isOpeningParenToken, isClosingParenToken } from '@eslint-community/eslint-utils';
import { isNotWhitespace, isWhitespace } from './ast.js';
import type { OffsetContext } from './offset-context.js';

export type AnyToken = AST.Token | AST.Comment;
export type MaybeNode = {
	type: string;
	range: [number, number];
	loc: AST.SourceLocation;
};

export type IndentOptions = {
	indentChar: ' ' | '\t';
	indentScript: boolean;
	indentSize: number;
	switchCase: number;
	alignAttributesVertically: boolean;
	ignoredNodes: string[];
};

export type IndentContext = {
	sourceCode: SourceCode;
	options: IndentOptions;
	offsets: OffsetContext;
};

/**
 * Get the first and last tokens of the given node.
 * If the node is parenthesized, this gets the outermost parentheses.
 * If the node have whitespace at the start and the end, they will be skipped.
 */
export function getFirstAndLastTokens(
	sourceCode: SourceCode,
	node: ASTNode | AnyToken | MaybeNode,
	borderOffset = 0
): { firstToken: AST.Token; lastToken: AST.Token } {
	let firstToken = sourceCode.getFirstToken(node);
	let lastToken = sourceCode.getLastToken(node);

	// Get the outermost left parenthesis if it's parenthesized.
	let left: AST.Token | null, right: AST.Token | null;
	while (
		(left = sourceCode.getTokenBefore(firstToken)) != null &&
		(right = sourceCode.getTokenAfter(lastToken)) != null &&
		isOpeningParenToken(left) &&
		isClosingParenToken(right) &&
		borderOffset <= left.range[0]
	) {
		firstToken = left;
		lastToken = right;
	}

	while (isWhitespace(firstToken) && firstToken.range[0] < lastToken.range[0]) {
		firstToken = sourceCode.getTokenAfter(firstToken) as AST.Token;
	}
	while (isWhitespace(lastToken) && firstToken.range[0] < lastToken.range[0]) {
		lastToken = sourceCode.getTokenBefore(lastToken) as AST.Token;
	}

	return { firstToken, lastToken };
}

/**
 * Check whether the given node or token is the beginning of a line.
 */
export function isBeginningOfLine(
	sourceCode: SourceCode,
	node: ASTNode | AnyToken | MaybeNode
): boolean {
	const prevToken = sourceCode.getTokenBefore(node, {
		includeComments: false,
		filter: isNotWhitespace
	});

	return !prevToken || prevToken.loc.end.line < node.loc.start.line;
}

/**
 * Check whether the given node is the beginning of element.
 */
export function isBeginningOfElement(node: AST.SvelteText): boolean {
	if (
		node.parent.type === 'SvelteElement' ||
		node.parent.type === 'SvelteAwaitCatchBlock' ||
		node.parent.type === 'SvelteAwaitPendingBlock' ||
		node.parent.type === 'SvelteAwaitThenBlock' ||
		node.parent.type === 'SvelteEachBlock' ||
		node.parent.type === 'SvelteElseBlock' ||
		node.parent.type === 'SvelteIfBlock' ||
		node.parent.type === 'SvelteKeyBlock' ||
		node.parent.type === 'SvelteSnippetBlock' ||
		node.parent.type === 'SvelteStyleElement'
	) {
		return node.parent.children[0] === node;
	}
	if (node.parent.type === 'Program') {
		return node.parent.body[0] === node;
	}
	return assertNever(node.parent);
}

/**
 * Throws an error when invoked.
 */
function assertNever(value: never): never {
	throw new Error(`This part of the code should never be reached but ${value} made it through.`);
}
