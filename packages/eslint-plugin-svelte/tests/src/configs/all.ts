import assert from 'assert';
import plugin from '../../../src/index.js';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';

describe('`all` config', () => {
	let ESLint: typeof ESLintClass;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
	});

	it('`all` config should work. ', async () => {
		const code = `<script>const a = 1, b = 2;</script>{@html a+b}`;

		const linter = new ESLint({
			overrideConfigFile: true,
			overrideConfig: plugin.configs['flat/all']
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line, message: m.message })),
			[
				{
					ruleId: 'svelte/no-at-html-tags',
					message: '`{@html}` can lead to XSS attack.',
					line: 1
				}
			]
		);
	});
});
