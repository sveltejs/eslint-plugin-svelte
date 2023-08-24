import path from 'path';
import type Md from 'markdown-it';
import type Token from 'markdown-it/lib/token';

export default (md: Md, options: { baseUrl: string; root: string }): void => {
	const base = options.baseUrl;
	const root = path.resolve(options.root);

	/** Normalize href */
	function normalizeHref(curr: string, href: string) {
		let absolutePath;
		let hash = '';
		if (/\.md(?:#.*)?$/.test(href)) {
			hash = /\.md(#.*)?$/.exec(href)![1] || '';
			absolutePath = path.join(path.dirname(curr), hash ? href.slice(0, -hash.length) : href);
		} else {
			// hash only
			absolutePath = curr;
			hash = href;
		}

		return `${base}/${path
			.relative(root, absolutePath)
			.replace(/README\.md$/, '')
			.replace(/\.md$/, '')}/${hash}`
			.replace(/\\/gu, '/')
			.replace(/\/+/gu, '/');
	}

	md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
		const token = tokens[idx];
		const hrefIndex = token.attrIndex('href');
		if (hrefIndex >= 0) {
			const link = token.attrs![hrefIndex];
			const href = link[1];
			if (/^https?:/.test(href)) {
				const proxyToken = {
					...token,
					attrs: [...token.attrs!, ['target', '_blank'], ['rel', 'noopener noreferrer']]
				} as Token;
				return self.renderToken([proxyToken], 0, options);
			} else if (/\.md(?:#.*)?$/.test(href) || /^#.*$/.test(href)) {
				const proxyToken = {
					...token,
					attrs: [
						...token.attrs!.slice(0, hrefIndex - 1),
						[link[0], normalizeHref(env.id, href)],
						...token.attrs!.slice(hrefIndex + 1)
					]
				} as Token;
				return self.renderToken([proxyToken], 0, options);
			}
		}
		return self.renderToken(tokens, idx, options);
	};
};
