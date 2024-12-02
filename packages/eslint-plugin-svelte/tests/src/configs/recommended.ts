import assert from 'assert';
import semver from 'semver';
import plugin from '../../../src/index.js';
import { ESLint } from '../../utils/eslint-compat.js';

describe('`recommended` config', () => {
	it('`recommended` config should work. ', async () => {
		if (semver.satisfies(ESLint.version, '<8.0.0')) return;
		const code = `<script>const a = 1, b = 2;</script>{@html a+b}`;

		const linter = new ESLint({
			overrideConfigFile: true as never,
			overrideConfig: plugin.configs['flat/recommended'] as never
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
