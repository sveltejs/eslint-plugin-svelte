import type { AST } from 'svelte-eslint-parser';
import type { RuleContext } from '../../types.js';

const SVELTE_IGNORE_PATTERN = /^\s*svelte-ignore\s+/;

/** Matches parenthetical notes in svelte-ignore comments, e.g. "(because of reasons)" */
const PARENTHETICAL_NOTE_PATTERN = /\([^)]*\)/gu;

/**
 * Map of legacy code -> new code
 * See https://github.com/sveltejs/svelte/blob/c9202a889612df3c2fcb369096a5573668be99d6/packages/svelte/src/compiler/utils/extract_svelte_ignore.js#L6
 */
const V5_REPLACEMENTS: Record<string, string | undefined> = {
	'non-top-level-reactive-declaration': 'reactive_declaration_invalid_placement',
	'module-script-reactive-declaration': 'reactive_declaration_module_script',
	'empty-block': 'block_empty',
	'avoid-is': 'attribute_avoid_is',
	'invalid-html-attribute': 'attribute_invalid_property_name',
	'a11y-structure': 'a11y_figcaption_parent',
	'illegal-attribute-character': 'attribute_illegal_colon',
	'invalid-rest-eachblock-binding': 'bind_invalid_each_rest',
	'unused-export-let': 'export_let_unused'
};

/**
 * Runtime warnings that Svelte v5 lets you silence with `svelte-ignore`.
 * The compiler never reports them, so we can't tell whether the comment is used.
 * Keep in sync with `IGNORABLE_RUNTIME_WARNINGS` in the Svelte compiler:
 * https://github.com/sveltejs/svelte/blob/70afafe18e48a9973c5f711d62d87d088234655e/packages/svelte/src/constants.js#L47-L56
 */
export const RUNTIME_WARNING_CODES = new Set([
	'await_reactivity_loss',
	'await_waterfall',
	'binding_property_non_reactive',
	'hydration_attribute_changed',
	'hydration_html_changed',
	'ownership_invalid_binding',
	'ownership_invalid_mutation',
	'state_snapshot_uncloneable'
]);

export type IgnoreItemWithoutCode = {
	range: [number, number];
	code: null;
	token: AST.Token | AST.Comment;
};
export type IgnoreItem = {
	range: [number, number];
	code: string;
	codeForV5: string; // Code targeting Svelte v5.
	/**
	 * Whether Svelte v5 reads this code in runes mode.
	 * In runes mode, codes must be separated by commas, and everything after is prose.
	 */
	readInRunesMode: boolean;
	token: AST.Token | AST.Comment;
};

/** Extract all svelte-ignore comment items */
export function getSvelteIgnoreItems(context: RuleContext): (IgnoreItem | IgnoreItemWithoutCode)[] {
	const sourceCode = context.sourceCode;

	const ignoreComments: (IgnoreItem | IgnoreItemWithoutCode)[] = [];
	for (const comment of sourceCode.getAllComments()) {
		const match = SVELTE_IGNORE_PATTERN.exec(comment.value);
		if (!match) {
			continue;
		}
		const codeListStart = match.index + match[0].length;
		const codeList = comment.value.slice(codeListStart);
		if (hasMissingCodeIgnore(codeList)) {
			ignoreComments.push({
				range: comment.range,
				code: null,
				token: comment
			});
		} else {
			const ignores = extractSvelteIgnore(comment.range[0] + 2, comment, codeList, codeListStart);
			if (ignores) {
				ignoreComments.push(...ignores);
			}
		}
	}
	for (const token of sourceCode.ast.tokens) {
		if (token.type === 'HTMLComment') {
			const text = token.value.slice(4, -3);
			const match = SVELTE_IGNORE_PATTERN.exec(text);
			if (!match) {
				continue;
			}
			const codeListStart = match.index + match[0].length;
			const codeList = text.slice(codeListStart);
			if (hasMissingCodeIgnore(codeList)) {
				ignoreComments.push({
					range: token.range,
					code: null,
					token
				});
			} else {
				const ignores = extractSvelteIgnore(token.range[0] + 4, token, codeList, codeListStart);
				if (ignores) {
					ignoreComments.push(...ignores);
				}
			}
		}
	}
	ignoreComments.sort((a, b) => b.range[0] - a.range[0]);
	return ignoreComments;
}

/** Extract svelte-ignore rule names */
function extractSvelteIgnore(
	startIndex: number,
	token: AST.Token | AST.Comment,
	codeList: string,
	ignoreStart: number
): IgnoreItem[] | null {
	const start = startIndex + ignoreStart;
	const results: IgnoreItem[] = [];
	const runesModeCodeStarts = getRunesModeCodeStarts(codeList);
	// Replace parenthetical notes (e.g., "(because of reasons)") with spaces of the same length
	// to preserve character positions while preventing note words from being treated as rule names.
	const processedCodeList = codeList.replace(PARENTHETICAL_NOTE_PATTERN, (match) =>
		' '.repeat(match.length)
	);
	const separatorPattern = /\s*[\s,]\s*/g;
	const separators = processedCodeList.matchAll(separatorPattern);
	let lastSeparatorEnd = 0;
	for (const separator of separators) {
		const code = processedCodeList.slice(lastSeparatorEnd, separator.index);
		if (code) {
			results.push({
				code,
				codeForV5: V5_REPLACEMENTS[code] || code.replace(/-/gu, '_'),
				readInRunesMode: runesModeCodeStarts.has(lastSeparatorEnd),
				range: [start + lastSeparatorEnd, start + separator.index],
				token
			});
		}
		lastSeparatorEnd = separator.index + separator[0].length;
	}
	if (results.length === 0) {
		const code = processedCodeList;
		results.push({
			code,
			codeForV5: V5_REPLACEMENTS[code] || code.replace(/-/gu, '_'),
			readInRunesMode: runesModeCodeStarts.has(0),
			range: [start, start + code.length],
			token
		});
	}

	return results;
}

/**
 * Get the start indexes of the codes that Svelte v5 reads in runes mode.
 * See https://github.com/sveltejs/svelte/blob/70afafe18e48a9973c5f711d62d87d088234655e/packages/svelte/src/compiler/utils/extract_svelte_ignore.js#L38-L63
 */
function getRunesModeCodeStarts(codeList: string): Set<number> {
	const starts = new Set<number>();
	for (const match of codeList.matchAll(/[\w$-]+(,)?/gu)) {
		starts.add(match.index);
		if (!match[1]) {
			break;
		}
	}
	return starts;
}

/** Checks whether given comment has missing code svelte-ignore */
function hasMissingCodeIgnore(codeList: string) {
	return !codeList.replace(PARENTHETICAL_NOTE_PATTERN, '').trim();
}
