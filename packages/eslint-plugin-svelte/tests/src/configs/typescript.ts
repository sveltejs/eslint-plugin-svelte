import assert from 'assert';
import plugin from '../../../src/index.js';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';

describe('`typescript` config', () => {
	let ESLint: typeof ESLintClass;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
	});

	it('should enable the project service for all files', async () => {
		const linter = new ESLint({
			overrideConfigFile: true,
			// ESLint only lints `.ts` files if a config targets them.
			overrideConfig: [...plugin.configs.typescript, { files: ['**/*.ts'] }]
		});

		for (const filePath of ['test.ts', 'test.svelte', 'test.svelte.ts', 'test.svelte.js']) {
			const { parserOptions } = (await linter.calculateConfigForFile(filePath)).languageOptions;
			assert.strictEqual(parserOptions.projectService, true, filePath);
			assert.deepStrictEqual(parserOptions.extraFileExtensions, ['.svelte'], filePath);
		}
	});

	it('should parse TypeScript in `.svelte`, `.svelte.ts` and `.svelte.js` files', async () => {
		const linter = new ESLint({
			overrideConfigFile: true,
			overrideConfig: [
				...plugin.configs.typescript,
				{
					// The files linted here are virtual, so they aren't part of any tsconfig.
					languageOptions: { parserOptions: { projectService: false } },
					rules: { 'svelte/no-at-html-tags': 'error' }
				}
			]
		});

		const svelte = await linter.lintText(
			`<script lang="ts">const a: number = 1;</script>\n{@html a}`,
			{ filePath: 'test.svelte' }
		);
		assert.deepStrictEqual(
			svelte[0].messages.map((m) => m.ruleId),
			['svelte/no-at-html-tags']
		);

		for (const filePath of ['test.svelte.ts', 'test.svelte.js']) {
			const result = await linter.lintText('export const a: number = 1;', { filePath });
			assert.deepStrictEqual(result[0].messages, [], filePath);
		}
	});
});
