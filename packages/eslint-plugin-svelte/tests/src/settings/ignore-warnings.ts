import assert from 'assert';
import plugin from '../../../src/index';
import { ESLint } from '../../utils/eslint-compat';

describe('ignore-warnings', () => {
	it('disable rules if ignoreWarnings: [ruleName]', async () => {
		const code = `
      {@html a+b}
      {@debug a}
      <script>
        a+b;
      </script>
      {@html a+b}
      {@debug a}
      `;

		const linter = new ESLint({
			baseConfig: {
				files: ['**'],
				languageOptions: {
					parser: require('svelte-eslint-parser'),
					ecmaVersion: 2020
				},
				plugins: {
					// @ts-expect-error -- Type error for eslint v9
					svelte: plugin as never
				},
				rules: {
					'no-undef': 'error',
					'space-infix-ops': 'error',
					'svelte/no-at-html-tags': 'error',
					'svelte/no-at-debug-tags': 'error',
					'svelte/system': 'error'
				},
				settings: {
					svelte: {
						ignoreWarnings: ['no-undef', 'space-infix-ops', 'svelte/no-at-debug-tags']
					}
				},
				processor: 'svelte/svelte'
			},
			// @ts-expect-error -- Type error for eslint v9
			overrideConfigFile: true
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
			[
				{
					ruleId: 'svelte/no-at-html-tags',
					line: 2
				},
				{
					ruleId: 'no-undef',
					line: 5
				},
				{
					ruleId: 'space-infix-ops',
					line: 5
				},
				{
					ruleId: 'no-undef',
					line: 5
				},
				{
					ruleId: 'svelte/no-at-html-tags',
					line: 7
				}
			]
		);
	});
	it('disable rules if ignoreWarnings: [regexp]', async () => {
		const code = `
      {@html a+b}
      {@debug a}
      <script>
        a+b;
      </script>
      {@html a+b}
      {@debug a}
      `;

		const linter = new ESLint({
			baseConfig: {
				files: ['**'],
				languageOptions: {
					parser: require('svelte-eslint-parser'),
					ecmaVersion: 2020
				},
				plugins: {
					// @ts-expect-error -- Type error for eslint v9
					svelte: plugin as never
				},
				rules: {
					'no-undef': 'error',
					'space-infix-ops': 'error',
					'svelte/no-at-html-tags': 'error',
					'svelte/no-at-debug-tags': 'error',
					'svelte/system': 'error'
				},
				settings: {
					svelte: {
						ignoreWarnings: ['no-undef', '/debug/', '/^space/']
					}
				},
				processor: 'svelte/svelte'
			},
			// @ts-expect-error -- Type error for eslint v9
			overrideConfigFile: true
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
			[
				{
					line: 2,
					ruleId: 'svelte/no-at-html-tags'
				},
				{
					ruleId: 'no-undef',
					line: 5
				},
				{
					ruleId: 'space-infix-ops',
					line: 5
				},
				{
					ruleId: 'no-undef',
					line: 5
				},
				{
					ruleId: 'svelte/no-at-html-tags',
					line: 7
				}
			]
		);
	});

	it('without settings', async () => {
		const code = `
      {@html a+b}
      {@debug a}
      <script>
        a+b;
      </script>
      {@html a+b}
      {@debug a}
      `;

		const linter = new ESLint({
			baseConfig: {
				files: ['**'],
				languageOptions: {
					parser: require('svelte-eslint-parser'),
					ecmaVersion: 2020
				},
				plugins: {
					// @ts-expect-error -- Type error for eslint v9
					svelte: plugin as never
				},
				rules: {
					'svelte/system': 'error'
				},
				processor: 'svelte/svelte'
			},
			// @ts-expect-error -- Type error for eslint v9
			overrideConfigFile: true
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
			[]
		);
	});
});
