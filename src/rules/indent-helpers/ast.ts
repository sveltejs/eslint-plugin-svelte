import type { AST } from 'svelte-eslint-parser';
import type { TSESTree } from '@typescript-eslint/types';
type AnyToken = AST.Token | AST.Comment;
/**
 * Check whether the given token is a whitespace.
 */
export function isWhitespace(token: AnyToken | TSESTree.Comment | null | undefined): boolean {
	return (
		token != null &&
		((token.type === 'HTMLText' && !token.value.trim()) ||
			(token.type === 'JSXText' && !token.value.trim()))
	);
}

/**
 * Check whether the given token is a not whitespace.
 */
export function isNotWhitespace(token: AnyToken | TSESTree.Comment | null | undefined): boolean {
	return (
		token != null &&
		(token.type !== 'HTMLText' || Boolean(token.value.trim())) &&
		(token.type !== 'JSXText' || Boolean(token.value.trim()))
	);
}
