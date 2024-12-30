import assert from 'assert';
import plugin from '../../../src/index.js';
import { ESLint } from '../../utils/eslint-compat.js';
import * as svelteParser from 'svelte-eslint-parser';

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

// Initialize linter.
const linter = new ESLint({
	// @ts-expect-error -- Type error?
	baseConfig: {
		languageOptions: {
			parser: svelteParser,
			ecmaVersion: 2020
		},
		plugins: {
			svelte: plugin
		},
		rules: {
			'no-undef': 'error',
			'space-infix-ops': 'error',
			'svelte/no-at-html-tags': 'error',
			'svelte/comment-directive': 'error'
		},
		processor: 'svelte/svelte',
		files: ['**']
	},
	overrideConfigFile: true
});

describe('comment-directive', () => {
	describe('eslint-disable/eslint-enable', () => {
		it('disable all rules if <!-- eslint-disable -->', async () => {
			const code = `
      <!-- eslint-disable -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('disable specific rules if <!-- eslint-disable space-infix-ops -->', async () => {
			const code = `
      <!-- eslint-disable space-infix-ops -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 3);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'no-undef');
		});

		it('enable all rules if <!-- eslint-enable -->', async () => {
			const code = `
      <!-- eslint-disable -->
      {@html a+b}
      <!-- eslint-enable -->
      {@html a+b}
       `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 4);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[0].line, 5);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 5);
			assert.strictEqual(messages[2].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[2].line, 5);
			assert.strictEqual(messages[3].ruleId, 'no-undef');
			assert.strictEqual(messages[3].line, 5);
		});

		it('enable specific rules if <!-- eslint-enable space-infix-ops -->', async () => {
			const code = `
      <!-- eslint-disable svelte/no-at-html-tags, space-infix-ops -->
      {@html a+b}
      <!-- eslint-enable space-infix-ops -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 5);
			assert.strictEqual(messages[0].ruleId, 'no-undef');
			assert.strictEqual(messages[0].line, 3);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 3);
			assert.strictEqual(messages[2].ruleId, 'no-undef');
			assert.strictEqual(messages[2].line, 5);
			assert.strictEqual(messages[3].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[3].line, 5);
			assert.strictEqual(messages[4].ruleId, 'no-undef');
			assert.strictEqual(messages[4].line, 5);
		});

		it('should not affect to the code in <script>.', async () => {
			const code = `
      <!-- eslint-disable -->
      {@html a+b}
      <script>
        a;
      </script>
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].ruleId, 'no-undef');
		});

		it('disable specific rules if <!-- eslint-disable space-infix-ops ,, , svelte/no-at-html-tags -->', async () => {
			const code = `
      <!-- eslint-disable space-infix-ops ,, , svelte/no-at-html-tags -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 2);
			assert.strictEqual(messages[0].ruleId, 'no-undef');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
		});
	});

	describe('eslint-disable-line', () => {
		it('disable all rules if <!-- eslint-disable-line -->', async () => {
			const code = `
      {@html a+b} <!-- eslint-disable-line -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('disable specific rules if <!-- eslint-disable-line space-infix-ops -->', async () => {
			const code = `
      {@html a+b} <!-- eslint-disable-line space-infix-ops -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 3);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'no-undef');
		});

		it("don't disable rules if <!-- eslint-disable-line --> is on another line", async () => {
			const code = `
      <!-- eslint-disable-line -->
      {@html a+b}
      <!-- eslint-disable-line -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 4);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[3].ruleId, 'no-undef');
		});
	});

	describe('eslint-disable-next-line', () => {
		it('disable all rules if <!-- eslint-disable-next-line -->', async () => {
			const code = `
      <!-- eslint-disable-next-line -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('disable specific rules if <!-- eslint-disable-next-line space-infix-ops -->', async () => {
			const code = `
      <!-- eslint-disable-next-line space-infix-ops -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 3);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'no-undef');
		});

		it("don't disable rules if <!-- eslint-disable-next-line --> is on another line", async () => {
			const code = `
      <!-- eslint-disable-next-line -->

      {@html a+b} <!-- eslint-disable-next-line -->
      <!-- eslint-disable-next-line -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 4);

			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[0].line, 4);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 4);
			assert.strictEqual(messages[2].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[2].line, 4);
			assert.strictEqual(messages[3].ruleId, 'no-undef');
			assert.strictEqual(messages[3].line, 4);
		});

		it('should affect only the next line', async () => {
			const code = `
      <!-- eslint-disable-next-line svelte/no-at-html-tags, space-infix-ops -->
      {@html a+b}
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 6);
			assert.strictEqual(messages[0].ruleId, 'no-undef');
			assert.strictEqual(messages[0].line, 3);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 3);

			assert.strictEqual(messages[2].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[2].line, 4);
			assert.strictEqual(messages[3].ruleId, 'no-undef');
			assert.strictEqual(messages[3].line, 4);
			assert.strictEqual(messages[4].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[4].line, 4);
			assert.strictEqual(messages[5].ruleId, 'no-undef');
			assert.strictEqual(messages[5].line, 4);
		});
	});

	describe('allow description', () => {
		it('disable all rules if <!-- eslint-disable -- description -->', async () => {
			const code = `
      <!-- eslint-disable -- description -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('enable all rules if <!-- eslint-enable -- description -->', async () => {
			const code = `
      <!-- eslint-disable -- description -->
      {@html a+b}
      <!-- eslint-enable -- description -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 4);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[0].line, 5);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 5);
			assert.strictEqual(messages[2].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[2].line, 5);
			assert.strictEqual(messages[3].ruleId, 'no-undef');
			assert.strictEqual(messages[3].line, 5);
		});

		it('enable specific rules if <!-- eslint-enable space-infix-ops -- description -->', async () => {
			const code = `
      <!-- eslint-disable svelte/no-at-html-tags, space-infix-ops -- description -->
      {@html a+b}
      <!-- eslint-enable space-infix-ops -- description -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 5);
			assert.strictEqual(messages[0].ruleId, 'no-undef');
			assert.strictEqual(messages[0].line, 3);
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[1].line, 3);
			assert.strictEqual(messages[2].ruleId, 'no-undef');
			assert.strictEqual(messages[2].line, 5);
			assert.strictEqual(messages[3].ruleId, 'space-infix-ops');
			assert.strictEqual(messages[3].line, 5);
			assert.strictEqual(messages[4].ruleId, 'no-undef');
			assert.strictEqual(messages[4].line, 5);
		});

		it('disable all rules if <!-- eslint-disable-line -- description -->', async () => {
			const code = `
      {@html a+b} <!-- eslint-disable-line -- description -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('disable specific rules if <!-- eslint-disable-line space-infix-ops -- description -->', async () => {
			const code = `
      {@html a+b} <!-- eslint-disable-line space-infix-ops -- description -->
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 3);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'no-undef');
		});

		it('disable all rules if <!-- eslint-disable-next-line -- description -->', async () => {
			const code = `
      <!-- eslint-disable-next-line -- description -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 0);
		});

		it('disable specific rules if <!-- eslint-disable-next-line space-infix-ops -->', async () => {
			const code = `
      <!-- eslint-disable-next-line space-infix-ops -- description -->
      {@html a+b}
      `;
			const result = await linter.lintText(code, { filePath: 'test.svelte' });
			const messages = result[0].messages;

			assert.strictEqual(messages.length, 3);
			assert.strictEqual(messages[0].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[1].ruleId, 'no-undef');
			assert.strictEqual(messages[2].ruleId, 'no-undef');
		});
	});

	describe('reportUnusedDisableDirectives', () => {
		const linter = new ESLint({
			// @ts-expect-error -- Type error?
			baseConfig: {
				languageOptions: {
					parser: svelteParser,
					ecmaVersion: 2020
				},
				plugins: {
					svelte: plugin
				},
				rules: {
					'no-unused-vars': 'error',
					'svelte/comment-directive': ['error', { reportUnusedDisableDirectives: true }],
					'svelte/no-at-html-tags': 'error',
					'svelte/no-at-debug-tags': 'error'
				},
				files: ['**'],
				processor: 'svelte/svelte'
			},
			overrideConfigFile: true
		});
		it('report unused <!-- eslint-disable -->', async () => {
			const code = `
        <!-- eslint-disable -->
        <div>Hello</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				'Unused eslint-disable directive (no problems were reported).'
			);
			assert.strictEqual(messages[0].line, 2);
			assert.strictEqual(messages[0].column, 9);
		});

		it('dont report unused <!-- eslint-disable -->', async () => {
			const code = `
        <!-- eslint-disable -->
        <div>{@html foo}{@debug foo}</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 0);
		});
		it('disable and report unused <!-- eslint-disable -->', async () => {
			const code = `
        <!-- eslint-disable -->
        <div>{@html foo}{@debug foo}</div>
        <!-- eslint-enable -->
        <!-- eslint-disable -->
        <div>Hello</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				'Unused eslint-disable directive (no problems were reported).'
			);
			assert.strictEqual(messages[0].line, 5);
			assert.strictEqual(messages[0].column, 9);
		});

		it('report unused <!-- eslint-disable svelte/no-at-debug-tags, svelte/no-at-html-tags -->', async () => {
			const code = `
        <!-- eslint-disable svelte/no-at-debug-tags, svelte/no-at-html-tags -->
        <div>Hello</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 2);

			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				"Unused eslint-disable directive (no problems were reported from 'svelte/no-at-debug-tags')."
			);
			assert.strictEqual(messages[0].line, 2);
			assert.strictEqual(messages[0].column, 29);

			assert.strictEqual(messages[1].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[1].message,
				"Unused eslint-disable directive (no problems were reported from 'svelte/no-at-html-tags')."
			);
			assert.strictEqual(messages[1].line, 2);
			assert.strictEqual(messages[1].column, 54);
		});

		it('report unused <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->', async () => {
			const code = `
        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->
        <div>Hello</div>
        <div>{@html foo}{@debug foo}</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 4);

			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				"Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-debug-tags')."
			);
			assert.strictEqual(messages[0].line, 2);
			assert.strictEqual(messages[0].column, 39);

			assert.strictEqual(messages[1].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[1].message,
				"Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-html-tags')."
			);
			assert.strictEqual(messages[1].line, 2);
			assert.strictEqual(messages[1].column, 64);

			assert.strictEqual(messages[2].ruleId, 'svelte/no-at-html-tags');
			assert.strictEqual(messages[2].line, 4);
			assert.strictEqual(messages[3].ruleId, 'svelte/no-at-debug-tags');
			assert.strictEqual(messages[3].line, 4);
		});

		it('dont report used <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->', async () => {
			const code = `
        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->
        <div>{@html foo}{@debug foo}</div>
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.deepStrictEqual(messages, []);
		});

		it('dont report used, with duplicate eslint-disable', async () => {
			const code = `
        <!-- eslint-disable -->
        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->
        <div>{@html foo}</div><!-- eslint-disable-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.deepStrictEqual(messages, []);
		});

		it('report unused <!-- eslint-enable -->', async () => {
			const code = `
        <!-- eslint-enable -->
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				'Unused eslint-enable directive (reporting is not suppressed).'
			);
			assert.strictEqual(messages[0].line, 2);
			assert.strictEqual(messages[0].column, 9);
		});
		it('report unused <!-- eslint-enable svelte/no-at-debug-tags -->', async () => {
			const code = `
        <!-- eslint-disable svelte/no-at-html-tags -->
        <div>{@html foo}</div>
        <!-- eslint-enable svelte/no-at-debug-tags -->
      `;
			const messages = (await linter.lintText(code, { filePath: 'test.svelte' }))[0].messages;

			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].ruleId, 'svelte/comment-directive');
			assert.strictEqual(
				messages[0].message,
				"Unused eslint-enable directive (reporting from 'svelte/no-at-debug-tags' is not suppressed)."
			);
			assert.strictEqual(messages[0].line, 4);
			assert.strictEqual(messages[0].column, 28);
		});
	});
});
