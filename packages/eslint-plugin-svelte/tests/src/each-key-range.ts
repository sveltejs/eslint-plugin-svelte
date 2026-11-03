import assert from 'assert';
import { Linter } from 'eslint';
import * as parser from 'svelte-eslint-parser';
import rule from '../../src/rules/require-each-key.js';

describe('require-each-key diagnostic range', () => {
	for (const header of [
		'{#each values as item}',
		'{#each values as {id}}',
		'{#each values as item, index}',
		'{#each\n values as item,\n index}'
	]) {
		it(`highlights only the opening tag: ${header}`, () => {
			const messages = new Linter({ configType: 'flat' }).verify(
				`${header}\n  <p>content</p>\n{/each}`,
				{
					files: ['**'],
					languageOptions: { parser },
					plugins: { test: { rules: { rule } } },
					rules: { 'test/rule': 'error' }
				},
				{ filename: 'test.svelte' }
			);
			assert.strictEqual(messages.length, 1);
			assert.strictEqual(messages[0].messageId, 'expectedKey');
			const lines = header.split('\n');
			assert.deepStrictEqual(
				{
					line: messages[0].line,
					column: messages[0].column,
					endLine: messages[0].endLine,
					endColumn: messages[0].endColumn
				},
				{ line: 1, column: 1, endLine: lines.length, endColumn: lines[lines.length - 1].length + 1 }
			);
		});
	}
});
