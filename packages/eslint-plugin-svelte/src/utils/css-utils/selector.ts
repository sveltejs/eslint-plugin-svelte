import type { Rule } from 'postcss';
import type { Root as SelectorRoot } from 'postcss-selector-parser';

/**
 * Parses the selector of a PostCSS rule. Returns null if it can't be parsed.
 */
export function parseSelector(
	rule: Rule,
	getStyleSelectorAST: (rule: Rule) => SelectorRoot
): SelectorRoot | null {
	try {
		return getStyleSelectorAST(rule);
	} catch {
		// Svelte treats `<!-- ... -->` in CSS as a comment, but the selector parser does not.
		// Replace it with spaces (keeping line breaks so that locations stay the same) and try again.
		// Quoted strings (e.g. `[title="<!--"]`) are matched too, so that they are kept as they are.
		const selector = rule.selector.replace(
			/(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1|<!--[\s\S]*?-->/gu,
			(match) => (match.startsWith('<!--') ? match.replace(/[^\n\r]/gu, ' ') : match)
		);
		if (selector === rule.selector) {
			return null;
		}
		try {
			return getStyleSelectorAST(rule.clone({ selector }));
		} catch {
			return null;
		}
	}
}
