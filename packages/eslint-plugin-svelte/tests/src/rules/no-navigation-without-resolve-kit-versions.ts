import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Linter } from 'eslint';
import * as svelteParser from 'svelte-eslint-parser';
import plugin from '../../../src/index.js';

const CODE = `<script>
	import { goto, preloadCode } from '$app/navigation';
	import { resolve } from '$app/paths';

	goto('/blog/hello');
	goto('/');
	goto('/?q=1');
	preloadCode('/blog/[slug]');
	preloadCode(resolve('/blog/hello'));
</script>

<a href="/about">Click me!</a>
<a href="/manual.pdf">Click me!</a>
`;

type Result = { line: number; messageId: string | undefined; suggestions: string[] };

// SvelteKit is detected from the installed package, so each version gets its own project.
describe('no-navigation-without-resolve with different SvelteKit versions', () => {
	let root: string;

	before(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-svelte-resolve-'));
	});
	after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	function lint(version: string): Result[] {
		const project = path.join(root, version);
		const kit = path.join(project, 'node_modules/@sveltejs/kit');
		fs.mkdirSync(kit, { recursive: true });
		fs.writeFileSync(
			path.join(project, 'package.json'),
			JSON.stringify({ devDependencies: { '@sveltejs/kit': `^${version}` } })
		);
		fs.writeFileSync(path.join(kit, 'package.json'), JSON.stringify({ version }));

		const filename = path.join(project, 'src/routes/+page.svelte');
		const linter = new Linter({ cwd: project });
		const messages = linter.verify(
			CODE,
			{
				files: ['**/*.svelte'],
				plugins: { svelte: plugin as never },
				languageOptions: { parser: svelteParser },
				rules: { 'svelte/no-navigation-without-resolve': 'error' }
			},
			filename
		);
		return messages.map((message) => ({
			line: message.line,
			messageId: message.messageId,
			suggestions: (message.suggestions ?? []).map((suggestion) => {
				const output =
					CODE.slice(0, suggestion.fix.range[0]) +
					suggestion.fix.text +
					CODE.slice(suggestion.fix.range[1]);
				// The changed line only (the existing `$app/paths` import is reused).
				return output.split('\n')[message.line - 1] ?? '';
			})
		}));
	}

	it('does not run before SvelteKit 2.26 (no `resolve()`)', () => {
		assert.deepStrictEqual(lint('2.25.0'), []);
	});

	it('suggests route IDs / pathnames with a leading slash on SvelteKit 2', () => {
		assert.deepStrictEqual(lint('2.26.0'), [
			{ line: 5, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('/blog/hello'));"] },
			{ line: 6, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('/'));"] },
			{ line: 7, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('/?q=1'));"] },
			// `preloadCode()` takes a pathname on SvelteKit 2.
			{ line: 8, messageId: 'rootRelative', suggestions: [] },
			// A resolved URL is a pathname, which SvelteKit 2 expects.
			{
				line: 12,
				messageId: 'rootRelativeLink',
				suggestions: ["<a href={resolve('/about')}>Click me!</a>"]
			},
			{
				line: 13,
				messageId: 'rootRelativeFile',
				suggestions: [
					"<a href={asset('/manual.pdf')}>Click me!</a>",
					"<a href={resolve('/manual.pdf')}>Click me!</a>"
				]
			}
		]);
	});

	it('suggests pathnames without a leading slash on SvelteKit 3', () => {
		assert.deepStrictEqual(lint('3.1.1'), [
			{ line: 5, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('blog/hello'));"] },
			// `/` stays the root route ID.
			{ line: 6, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('/'));"] },
			{ line: 7, messageId: 'rootRelative', suggestions: ["\tgoto(resolve('/?q=1'));"] },
			// `preloadCode()` takes a route ID on SvelteKit 3: a route ID is fine, a URL is not.
			{ line: 9, messageId: 'preloadCodeRouteId', suggestions: [] },
			{
				line: 12,
				messageId: 'rootRelativeLink',
				suggestions: ["<a href={resolve('about')}>Click me!</a>"]
			},
			{
				line: 13,
				messageId: 'rootRelativeFile',
				suggestions: [
					"<a href={asset('manual.pdf')}>Click me!</a>",
					"<a href={resolve('manual.pdf')}>Click me!</a>"
				]
			}
		]);
	});
});
