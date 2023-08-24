import { markdownPath } from '$lib/utils.js';
const docs = import.meta.glob('../../../docs/**/*.md');

export const prerender = true;
export const trailingSlash = 'always';

/** @type {import('@sveltejs/kit').Load} */
export async function load({ url }) {
	const markdown = `../../../docs/${markdownPath(url.pathname)}`;
	if (docs[markdown]) {
		return {
			moduleData: await docs[markdown]()
		};
	}

	// 404
	return {
		moduleData: {
			frontmatter: { title: '404', hiddenMenu: true }
		}
	};
}
