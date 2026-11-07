import assert from 'assert';
import { Linter } from 'eslint';
import * as svelteParser from 'svelte-eslint-parser';
import rule from '../../../src/rules/no-navigation-without-resolve.js';

describe('no-navigation-without-resolve array spread complexity', () => {
	it('bounds repeated expansion of shared empty arrays', function () {
		this.timeout(5000);
		// Every array is empty at runtime. Without caching, 30 levels require over a
		// billion expansions even though no array reaches the element limit.
		const declarations = ['const a0 = [];'];
		for (let index = 1; index <= 30; index++) {
			declarations.push(`const a${index} = [...a${index - 1}, ...a${index - 1}];`);
		}
		const code = `<script>${declarations.join('\n')}</script>
			{#each a30 as href}<a {href}>link</a>{/each}
			<a href={a30[0]}>index</a>`;
		const messages = new Linter({ configType: 'flat' }).verify(
			code,
			{
				files: ['**/*.svelte'],
				languageOptions: { parser: svelteParser },
				plugins: { test: { rules: { navigation: rule as never } } },
				rules: { 'test/navigation': 'error' }
			},
			'page.svelte'
		);
		assert.deepStrictEqual(messages, []);
	});
});
