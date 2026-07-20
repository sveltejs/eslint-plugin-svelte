import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as svelteParser from 'svelte-eslint-parser';
import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-conflicting-module-names.js';

// This rule inspects the real filesystem (sibling files next to the linted
// `.svelte` file), so the tests point the RuleTester at real fixture files on
// disk instead of using `loadTestCases`. The fixture loader would otherwise
// collect the sibling module files (e.g. `Foo.svelte.ts`) as their own test
// cases, so a dedicated fixture directory driven directly by the RuleTester is
// used here.
const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)));
const FIXTURES_ROOT = path.resolve(__dirname, '../../fixtures/rules/no-conflicting-module-names');

function fixture(...segments: string[]): { code: string; filename: string } {
	const filename = path.join(FIXTURES_ROOT, ...segments);
	return { code: fs.readFileSync(filename, 'utf8'), filename };
}

const tester = new RuleTester({
	languageOptions: {
		parser: svelteParser,
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

// One invalid fixture directory per module extension, so every entry of the
// rule's MODULE_EXTENSIONS is covered (a mutant deleting any extension is
// killed by the matching case below).
const INVALID_EXTENSIONS = ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'];

tester.run('no-conflicting-module-names', rule as any, {
	valid: [
		// Component with no sibling module.
		fixture('valid', 'no-sibling', 'Foo.svelte'),
		// Component with a differently-named module sibling.
		fixture('valid', 'different-module', 'Foo.svelte'),
		// Component with only a `.d.ts` declaration sibling.
		fixture('valid', 'declaration-sibling', 'Foo.svelte'),
		// Component with only a `.d.svelte.ts` declaration sibling.
		fixture('valid', 'declaration-sibling-d-svelte', 'Bar.svelte'),
		// Untitled/virtual file with a fake path that does not exist on disk.
		{ code: '<p>virtual</p>', filename: path.join(FIXTURES_ROOT, 'does-not-exist', 'Foo.svelte') }
	],
	invalid: INVALID_EXTENSIONS.map((ext) => ({
		...fixture('invalid', ext, 'Foo.svelte'),
		errors: [
			{
				messageId: 'conflict',
				data: {
					conflictingName: `Foo.svelte.${ext}`,
					svelteName: 'Foo.svelte',
					specifier: './Foo.svelte'
				},
				line: 1,
				column: 1
			}
		]
	}))
});
