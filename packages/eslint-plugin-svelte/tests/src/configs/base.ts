import assert from 'assert';
import plugin from '../../../src/index.js';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';

describe('`base` config', () => {
	let ESLint: typeof ESLintClass;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
	});

	it('`base` config should work. ', async () => {
		const code = `<script>const a = 1, b = 2;</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html a+b}
{@html a+b}`;
		const linter = new ESLint({
			overrideConfigFile: true,
			overrideConfig: [
				...plugin.configs['flat/base'],
				{
					rules: {
						'svelte/no-at-html-tags': 'error'
					}
				}
			]
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line, message: m.message })),
			[
				{
					ruleId: 'svelte/no-at-html-tags',
					message: '`{@html}` can lead to XSS attack.',
					line: 4
				}
			]
		);

		const resultWithJs = await linter.lintText(';', { filePath: 'test.js' });
		const messagesWithJs = resultWithJs[0].messages;

		assert.deepStrictEqual(
			messagesWithJs.map((m) => ({
				ruleId: m.ruleId,
				line: m.line,
				message: m.message
			})),
			[]
		);
	});
});
