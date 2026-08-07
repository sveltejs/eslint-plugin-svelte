import type Md from 'markdown-it';

const ALERT_PATTERN = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$/u;

/** Render GitHub-style blockquote alerts without changing the source markdown. */
export default (md: Md): void => {
	md.core.ruler.after('inline', 'github_alerts', (state) => {
		for (let index = 0; index < state.tokens.length; index++) {
			const openingToken = state.tokens[index];
			if (openingToken.type !== 'blockquote_open') continue;

			const closingIndex = state.tokens.findIndex(
				(token, tokenIndex) => tokenIndex > index && token.type === 'blockquote_close'
			);
			const inlineIndex = state.tokens.findIndex(
				(token, tokenIndex) =>
					tokenIndex > index && tokenIndex < closingIndex && token.type === 'inline'
			);
			const inlineToken = state.tokens[inlineIndex];
			const firstChild = inlineToken?.children?.[0];
			const match = firstChild?.type === 'text' ? ALERT_PATTERN.exec(firstChild.content) : null;
			if (!match || !inlineToken?.children) continue;

			const kind = match[1].toLowerCase();
			openingToken.attrJoin('class', `markdown-alert markdown-alert-${kind}`);
			openingToken.attrSet('aria-label', match[1]);

			// Markdown-it keeps the alert marker and its body in the same inline token.
			// Remove only the marker and the line break that follows it.
			inlineToken.children.shift();
			if (inlineToken.children[0]?.type === 'softbreak') {
				inlineToken.children.shift();
			}
		}
	});
};
