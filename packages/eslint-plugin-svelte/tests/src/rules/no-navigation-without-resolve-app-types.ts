import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Linter } from 'eslint';
import * as svelteParser from 'svelte-eslint-parser';
import * as typescriptParser from '@typescript-eslint/parser';
import plugin from '../../../src/index.js';

const CODE = `<script lang="ts">
	import { goto } from '$app/navigation';
	import type { ResolvedPathname } from '$app/types';

	let { user, id, href }: { user: string; id: string; href: ResolvedPathname } = $props();
	goto(\`\${id}/edit\`);
	goto('/app' + id);
	goto(href);
</script>

<a href="https://github.com/{user}">GitHub</a>
<a href="{user}/x">x</a>
`;

// Before `svelte-kit sync`, `$app/types` declares `ResolvedPathname` as `string`.
const APP_TYPES = `
interface AppTypes { ResolvedPathname(): string }
declare module '$app/types' { export type ResolvedPathname = ReturnType<AppTypes['ResolvedPathname']>; }
declare module '$app/navigation' { export function goto(url: string | URL): Promise<void>; }
`;

describe('no-navigation-without-resolve without generated $app/types', () => {
	let root: string;

	before(() => {
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-svelte-app-types-'));
		fs.mkdirSync(path.join(root, 'src'));
		fs.writeFileSync(
			path.join(root, 'tsconfig.json'),
			JSON.stringify({
				compilerOptions: { strict: true, module: 'esnext', moduleResolution: 'bundler' },
				include: ['src/**/*']
			})
		);
		fs.writeFileSync(path.join(root, 'src/app.d.ts'), APP_TYPES);
		// SvelteKit is detected from the installed package.
		const kit = path.join(root, 'node_modules/@sveltejs/kit');
		fs.mkdirSync(kit, { recursive: true });
		fs.writeFileSync(path.join(kit, 'package.json'), JSON.stringify({ version: '2.47.1' }));
		fs.writeFileSync(
			path.join(root, 'package.json'),
			JSON.stringify({ devDependencies: { '@sveltejs/kit': '^2.47.1' } })
		);
	});
	after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	function lint(strict: boolean) {
		const filename = path.join(root, 'src/page.svelte');
		fs.writeFileSync(filename, CODE);
		return new Linter({ cwd: root })
			.verify(
				CODE,
				{
					files: ['**/*.svelte'],
					plugins: { svelte: plugin as never },
					languageOptions: {
						parser: svelteParser,
						parserOptions: {
							parser: typescriptParser,
							project: path.join(root, 'tsconfig.json'),
							extraFileExtensions: ['.svelte']
						}
					},
					rules: { 'svelte/no-navigation-without-resolve': ['error', { strict }] }
				},
				filename
			)
			.map((message) => `${message.line}:${message.messageId}`);
	}

	it('does not treat every string as a resolved pathname', () => {
		assert.deepStrictEqual(lint(false), ['7:rootRelative']);
	});

	it('still accepts ResolvedPathname by its name in strict mode', () => {
		// Line 8 (`goto(href)`) is accepted.
		assert.deepStrictEqual(lint(true), ['6:strictUnknown', '7:rootRelative', '12:strictUnknown']);
	});
});
