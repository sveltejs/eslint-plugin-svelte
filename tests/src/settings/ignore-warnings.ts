import assert from 'assert';
import eslint from 'eslint';
import plugin from '../../../src/index';

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

		const linter = new eslint.ESLint({
			plugins: {
				svelte: plugin as never
			},
			baseConfig: {
				parser: require.resolve('svelte-eslint-parser'),
				parserOptions: {
					ecmaVersion: 2020
				},
				plugins: ['svelte'],
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
				}
			},
			useEslintrc: false
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

		const linter = new eslint.ESLint({
			plugins: {
				svelte: plugin as never
			},
			baseConfig: {
				parser: require.resolve('svelte-eslint-parser'),
				parserOptions: {
					ecmaVersion: 2020
				},
				plugins: ['svelte'],
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
				}
			},
			useEslintrc: false
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

		const linter = new eslint.ESLint({
			plugins: {
				svelte: plugin as never
			},
			baseConfig: {
				parser: require.resolve('svelte-eslint-parser'),
				parserOptions: {
					ecmaVersion: 2020
				},
				plugins: ['svelte'],
				rules: {
					'svelte/system': 'error'
				}
			},
			useEslintrc: false
		});
		const result = await linter.lintText(code, { filePath: 'test.svelte' });
		const messages = result[0].messages;

		assert.deepStrictEqual(
			messages.map((m) => ({ ruleId: m.ruleId, line: m.line })),
			[]
		);
	});
});
