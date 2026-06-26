import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';
import * as svelteParser from 'svelte-eslint-parser';
import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-useless-props.js';

// This rule pre-scans a whole project from disk, so it is driven by real fixture
// files (App renders Child passing `used` but never `unused`) with absolute
// `include`/`filename`, rather than the standard inline fixture harness.
const projectDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../fixtures/rules/no-useless-props/project'
);
const appPath = path.join(projectDir, 'App.svelte');
const childPath = path.join(projectDir, 'Child.svelte');
const appCode = fs.readFileSync(appPath, 'utf8');
const childCode = fs.readFileSync(childPath, 'utf8');

const options = [{ include: [projectDir], aliases: {} }];

const tester = new RuleTester({
	languageOptions: {
		parser: svelteParser,
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

// This rule (and `svelte-shaker`) targets Svelte 5 runes, and it loads
// `svelte-shaker` via synchronous `require()`, which needs Node's require(ESM)
// support (>=22.12). On the older-Svelte / older-Node legs of the test matrix the
// rule is inert, so run the real cases only where it can actually fire.
const require = createRequire(import.meta.url);
const svelteMajor = Number(String(require('svelte/package.json').version).split('.')[0]);
const SUPPORTED =
	svelteMajor >= 5 && semver.gte(semver.coerce(process.version)!, '22.12.0');

tester.run(
	'no-useless-props',
	rule as any,
	SUPPORTED
		? {
				valid: [
					// App is rendered by nobody (zero call sites) → treated as an entry and
					// skipped; it also passes `used`, so nothing here is useless.
					{ code: appCode, filename: appPath, options }
				],
				invalid: [
					{
						// Child declares `unused`, which no call site in the project passes.
						code: childCode,
						filename: childPath,
						options,
						errors: [{ messageId: 'uselessProp', line: 2 }]
					}
				]
			}
		: { valid: [], invalid: [] }
);
