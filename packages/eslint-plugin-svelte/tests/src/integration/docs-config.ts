import assert from 'assert';
import fs from 'fs';
import { ESLint } from 'eslint';
import ts from 'typescript-eslint';
import svelte from '../../../src/index.js';

describe('TypeScript documentation configuration', () => {
	it('uses the same project service extensions for TypeScript and Svelte files', async function () {
		if (Number(ESLint.version.split('.')[0]) < 9) this.skip();
		const { defineConfig } = await import('eslint/config');
		// Core recommended rules do not affect the parser settings under test.
		const js = { configs: { recommended: {} } };
		const readme = fs.readFileSync(new URL('../../../../../README.md', import.meta.url), 'utf8');
		const sections = readme.split('#### TypeScript project');
		// [1] is the basic config, [2] is the one with further options.
		for (const [index, section] of [sections[1], sections[2]].entries()) {
			const code = section.split('```js\n')[1].split('```')[0];
			const config = new Function(
				'js',
				'ts',
				'svelte',
				'defineConfig',
				'svelteConfig',
				code.replace(/^import .*;\n/gmu, '').replace('export default', 'return')
			)(js, ts, svelte, defineConfig, {});
			const linter = new ESLint({ overrideConfigFile: true, overrideConfig: config });
			for (const file of [
				'example.ts',
				'example.svelte',
				'example.svelte.ts',
				'example.svelte.js'
			]) {
				const resolved = await linter.calculateConfigForFile(file);
				assert.deepStrictEqual(
					resolved.languageOptions.parserOptions.extraFileExtensions,
					['.svelte'],
					file
				);
				if (index === 0) {
					assert.strictEqual(resolved.languageOptions.parserOptions.projectService, true, file);
				}
			}
		}
	});
});
