import { readFile } from 'node:fs/promises';
import MarkdownIt from 'markdown-it';
import Shiki from '@shikijs/markdown-it';

function headingRenderer(md: MarkdownIt) {
	const buildId = (text: string) => {
		return text
			.replace(/[^ \-0-9a-z]/gi, '')
			.trim()
			.replace(/\s+/g, '-')
			.toLowerCase();
	};

	md.renderer.rules.heading_open = function (tokens, idx) {
		const tag = tokens[idx].tag;
		const text = tokens[idx + 1].content;
		const id = buildId(text);
		return `<${tag} id=${id} tabindex="-1"><a href="#${id}">#</a>`;
	};
}

function noteRenderer(md: MarkdownIt) {
	md.renderer.rules.text = function (tokens, idx) {
		const text = tokens[idx].content;
		const match = /^::: (\S+)(\s.*)?$/.exec(text);
		if (match) {
			const type = match[1]?.trim();
			const title = (match[2] ?? type)?.trim();
			return `<div class="custom-block ${type}"><p class="custom-block-title">${title}</p>`;
		}
		if (text.startsWith(':::')) {
			return '</div>';
		}
		return text;
	};
}

const md = MarkdownIt();
md.use(headingRenderer);
md.use(noteRenderer);
md.use(
	await Shiki({
		themes: {
			light: 'vitesse-dark',
			dark: 'vitesse-dark'
		}
	})
);

function removeQuotes(str: string) {
	return str.replace(/^["']|["']$/g, '');
}

function extractFrontmatter(markdown: string) {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(markdown);
	if (!match) return { metadata: {}, body: markdown };

	const frontmatter = match[1];
	const body = markdown.slice(match[0].length);

	const metadata: Record<string, string> = {};
	frontmatter.split('\n').forEach((pair) => {
		const i = pair.indexOf(':');
		metadata[pair.slice(0, i).trim()] = removeQuotes(pair.slice(i + 1).trim());
	});

	return { metadata, body };
}

function removeComments(markdown: string) {
	return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

export async function getParsedMarkdown(
	path: string
): Promise<{ metadata: Record<string, string | number>; html: string }> {
	const markdown = await readFile(path, 'utf-8');
	const { metadata, body } = extractFrontmatter(markdown);
	const bodyWithoutComment = removeComments(body);
	const html = md.render(bodyWithoutComment);
	return { metadata, html };
}
