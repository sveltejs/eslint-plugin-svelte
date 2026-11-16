import assert from 'assert';
import plugin from '../../../src/index.js';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';

describe('`typescript` config', () => {
	let ESLint: typeof ESLintClass;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
	});

	it('should parse TypeScript in `.svelte`, `.svelte.ts` and `.svelte.js` files', async () => {
		const linter = new ESLint({
			overrideConfigFile: true,
			overrideConfig: [
				...plugin.configs.typescript,
				{
					rules: {
						'svelte/no-at-html-tags': 'error'
					}
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
