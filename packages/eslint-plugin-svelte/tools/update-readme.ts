import fs from 'fs';
import renderRulesTableContent from './render-rules.js';
import { writeAndFormat } from './lib/write.js';

const rootURL = new URL('../../../', import.meta.url);

const insertText = `\n${renderRulesTableContent(
	(name) => `https://sveltejs.github.io/eslint-plugin-svelte/rules/${name}/`
)}\n`;

const readmeFileURL = new URL('README.md', rootURL);
const newReadme = fs
	.readFileSync(readmeFileURL, 'utf8')
	.replace(
		/<!--RULES_TABLE_START-->[\s\S]*<!--RULES_TABLE_END-->/u,
		`<!--RULES_TABLE_START-->${insertText.replace(/\$/g, '$$$$')}<!--RULES_TABLE_END-->`
	);
void writeAndFormat(readmeFileURL, newReadme);

const docsReadmeFileURL = new URL('./docs/README.md', rootURL);

void writeAndFormat(
	docsReadmeFileURL,
	`---
title: "eslint-plugin-svelte"
---

${newReadme
	.replace('# eslint-plugin-svelte\n', '# Introduction\n')
	.replace(
		/<!--RULES_SECTION_START-->[\s\S]*<!--RULES_SECTION_END-->/u,
		'See [Available Rules](./rules.md).'
	)
	.replace(
		/<!--USAGE_SECTION_START-->[\s\S]*<!--USAGE_SECTION_END-->/u,
		'See [User Guide](./user-guide.md).'
	)
	.replace(/<!--DOCS_IGNORE_START-->[\s\S]*?<!--DOCS_IGNORE_END-->/gu, '')
	.replace(
		/\(https:\/\/sveltejs.github.io\/eslint-plugin-svelte(.*?)\)/gu,
		(_ptn, filepath: string) => {
			const [hash] = /(?:#.*)?$/u.exec(filepath)!;
			const pathWithoutHash = hash ? filepath.slice(0, -hash.length) : filepath;
			const normalizePathWithoutHash = pathWithoutHash.replace(/\/$/u, '');
			const [file] = /[^/]+$/u.exec(normalizePathWithoutHash)!;
			const pathWithoutFile = file
				? normalizePathWithoutHash.slice(0, -file.length)
				: normalizePathWithoutHash;

			let result = `(.${pathWithoutFile}`;
			if (file.endsWith('.html')) {
				result += file === 'index.html' ? 'README.md' : file.replace(/\.html$/, '.md');
			} else {
				result += `${file}.md`;
			}
			result += `${hash})`;
			return result;
		}
	)
	.replace(
		'[LICENSE](LICENSE)',
		'[LICENSE](https://github.com/sveltejs/eslint-plugin-svelte/blob/main/LICENSE)'
	)
	.replace(/\n{3,}/gu, '\n\n')}`
);

const docsUserGuideFileURL = new URL('./docs/user-guide.md', rootURL);

const docsUserGuide = fs.readFileSync(docsUserGuideFileURL, 'utf8');

void writeAndFormat(
	docsUserGuideFileURL,
	docsUserGuide
		.replace(
			/<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u,
			/<!--USAGE_GUIDE_START-->[\s\S]*<!--USAGE_GUIDE_END-->/u.exec(newReadme)![0]
		)
		.replace(
			/\(https:\/\/sveltejs.github.io\/eslint-plugin-svelte(.*?)\)/gu,
			(_s: string, c: string) => `(.${c.endsWith('/') ? c.slice(0, -1) : c}.md)`
		)
);
