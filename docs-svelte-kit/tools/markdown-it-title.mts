import type Md from 'markdown-it';
/**
 * @param {import('markdown-it')} md
 */
export default (md: Md): void => {
	const headingOpen = md.renderer.rules.heading_open;

	md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
		const head = headingOpen
			? headingOpen(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);
		const token = tokens[idx];
		const level = Number(token.tag.substr(1));
		if (level > 1) {
			return head;
		}
		const title = tokens[idx + 1]
			.children!.filter(
				(token) => token.type === 'text' || token.type === 'emoji' || token.type === 'code_inline'
			)
			.reduce((acc, t) => acc + t.content, '')
			.trim();
		return `${head}

<svelte:head>
  {#if !frontmatter.title}
    <title>${title}</title>
    <meta property="og:title" content="${title}" />
  {/if}
</svelte:head>
`;
	};
};
