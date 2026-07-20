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
		{ code: '<p>virtual</p>', filename: path.join(FIXTURES_ROOT, 'does-not-exist', 'Foo.svelte') },

		// --- module side ---
		// Module with no component of the same name.
		fixture('valid', 'different-module', 'foo-state.svelte.ts'),
		// `Foo.svelte.d.ts` declares `Foo.svelte` and must not be reported. It
		// needs the TypeScript parser because it contains type-only syntax.
		{
			...fixture('valid', 'declaration-sibling', 'Foo.svelte.d.ts'),
			languageOptions: { parserOptions: { parser: '@typescript-eslint/parser' } }
		},
		// `Bar.d.svelte.ts` declares `Bar.svelte` and must not be reported.
		fixture('valid', 'declaration-sibling-d-svelte', 'Bar.d.svelte.ts'),
		// Module whose matching component does not exist on disk.
		{
			code: 'export const value = 1;',
			filename: path.join(FIXTURES_ROOT, 'does-not-exist', 'Foo.svelte.ts')
		}
	],
	invalid: [
		// Reported on the component.
		...INVALID_EXTENSIONS.map((ext) => ({
			...fixture('invalid', ext, 'Foo.svelte'),
			errors: [
				{
					messageId: 'conflictOnComponent',
					data: {
						moduleName: `Foo.svelte.${ext}`,
						specifier: './Foo.svelte'
					},
					line: 1,
					column: 1
				}
			]
		})),
		// Reported on the module, so the collision is surfaced even when only the
		// module file is part of the lint run.
		...INVALID_EXTENSIONS.map((ext) => ({
			...fixture('invalid', ext, `Foo.svelte.${ext}`),
			errors: [
				{
					messageId: 'conflictOnModule',
					data: {
						svelteName: 'Foo.svelte',
						specifier: './Foo.svelte'
					},
					line: 1,
					column: 1
				}
			]
		}))
	]
});
