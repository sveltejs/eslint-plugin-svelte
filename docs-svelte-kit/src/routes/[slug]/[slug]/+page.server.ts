import { getParsedMarkdown } from '$lib/server/markdown.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const content = await getParsedMarkdown(`${process.cwd()}/../docs/rules/${params.slug}.md`);

	if (content) {
		return { content };
	}

	error(404, 'Not found');
};
