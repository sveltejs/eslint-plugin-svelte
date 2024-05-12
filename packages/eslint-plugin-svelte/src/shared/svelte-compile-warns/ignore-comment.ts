import type { AST } from 'svelte-eslint-parser';
import type { RuleContext } from '../../types';
import { getSourceCode } from '../../utils/compat';

const SVELTE_IGNORE_PATTERN = /^\s*svelte-ignore/m;

export type IgnoreItemWithoutCode = {
	range: [number, number];
	code: null;
	token: AST.Token | AST.Comment;
};
export type IgnoreItem = {
	range: [number, number];
	code: string;
	token: AST.Token | AST.Comment;
};

/** Extract all svelte-ignore comment items */
export function getSvelteIgnoreItems(context: RuleContext): (IgnoreItem | IgnoreItemWithoutCode)[] {
	const sourceCode = getSourceCode(context);

	const ignoreComments: (IgnoreItem | IgnoreItemWithoutCode)[] = [];
	for (const comment of sourceCode.getAllComments()) {
		const ignores = extractSvelteIgnore(comment.value, comment.range[0] + 2, comment);
		if (ignores) {
			ignoreComments.push(...ignores);
		} else if (hasMissingCodeIgnore(comment.value)) {
			ignoreComments.push({
				range: comment.range,
				code: null,
				token: comment
			});
		}
	}
	for (const token of sourceCode.ast.tokens) {
		if (token.type === 'HTMLComment') {
			const text = token.value.slice(4, -3);
			const ignores = extractSvelteIgnore(text, token.range[0] + 4, token);
			if (ignores) {
				ignoreComments.push(...ignores);
			} else if (hasMissingCodeIgnore(text)) {
				ignoreComments.push({
					range: token.range,
					code: null,
					token
				});
			}
		}
	}
	ignoreComments.sort((a, b) => b.range[0] - a.range[0]);
	return ignoreComments;
}

/** Extract svelte-ignore rule names */
function extractSvelteIgnore(
	text: string,
	startIndex: number,
	token: AST.Token | AST.Comment
): IgnoreItem[] | null {
	const m1 = SVELTE_IGNORE_PATTERN.exec(text);
	if (!m1) {
		return null;
	}
	const ignoreStart = m1.index + m1[0].length;
	const beforeText = text.slice(ignoreStart);
	if (!/^\s/.test(beforeText) || !beforeText.trim()) {
		return null;
	}
	let start = startIndex + ignoreStart;

	const results: IgnoreItem[] = [];
	for (const code of beforeText.split(/\s/)) {
		const end = start + code.length;
		const trimmed = code.trim();
		if (trimmed) {
			results.push({
				code: trimmed,
				range: [start, end],
				token
			});
		}
		start = end + 1; /* space */
	}

	return results;
}

/** Checks whether given comment has missing code svelte-ignore */
function hasMissingCodeIgnore(text: string) {
	const m1 = SVELTE_IGNORE_PATTERN.exec(text);
	if (!m1) {
		return false;
	}
	const ignoreStart = m1.index + m1[0].length;
	const beforeText = text.slice(ignoreStart);
	return !beforeText.trim();
}
