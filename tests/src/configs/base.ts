import assert from 'assert';
import semver from 'semver';
import plugin from '../../../src/index';
import { LegacyESLint, ESLint } from '../../utils/eslint-compat';

describe('`base` config', () => {
	it('legacy `base` config should work. ', async () => {
		const code = `<script>const a = 1, b = 2;</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html a+b}
{@html a+b}`;

		const linter = new LegacyESLint({
			plugins: {
				svelte: plugin as never
			},
			baseConfig: {
				parserOptions: {
					ecmaVersion: 2020
				},
				extends: ['plugin:svelte/base'],
				rules: {
					'svelte/no-at-html-tags': 'error'
				}
			},
			useEslintrc: false
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
	});
	it('`base` config should work. ', async () => {
		if (semver.satisfies(ESLint.version, '<8.0.0')) return;
		const code = `<script>const a = 1, b = 2;</script>
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html a+b}
{@html a+b}`;
		const linter = new ESLint({
			overrideConfigFile: true as never,
			overrideConfig: [
				...plugin.configs['flat/base'],
				{
					rules: {
						'svelte/no-at-html-tags': 'error'
					}
				}
			] as never
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
