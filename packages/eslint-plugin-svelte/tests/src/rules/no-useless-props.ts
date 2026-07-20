import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import semver from 'semver';
import * as svelteParser from 'svelte-eslint-parser';
import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-useless-props.js';

// This rule pre-scans a whole project from disk, so each case points `include` at
// a self-contained fixture project and lints one file inside it by absolute path,
// rather than using the standard inline fixture harness.
const FIXTURES = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../fixtures/rules/no-useless-props'
);

/** A scenario directory and a reader for the file linted within it. */
function project(name: string): { dir: string; file: (f: string) => string } {
	const dir = path.join(FIXTURES, name);
	return { dir, file: (f) => path.join(dir, f) };
}

function read(file: string): string {
	return fs.readFileSync(file, 'utf8');
}

const tester = new RuleTester({
	languageOptions: {
		parser: svelteParser,
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

// The rule (and `svelte-shaker`) targets Svelte 5 runes, and it loads
// `svelte-shaker` via synchronous `require()`, which needs Node's require(ESM)
// support (>=22.12). On the older-Svelte / older-Node legs of the test matrix the
// rule is inert, so run the real cases only where it can actually fire.
const require = createRequire(import.meta.url);
const svelteMajor = Number(String(require('svelte/package.json').version).split('.')[0]);
const SUPPORTED = svelteMajor >= 5 && semver.gte(semver.coerce(process.version)!, '22.12.0');

const basic = project('basic');
const renamed = project('renamed');
const ways = project('ways-passed');
const spread = project('spread');
const escaped = project('escaped');
const entry = project('entry');
const alias = project('alias');
const multiSite = project('multi-site');
const multiple = project('multiple');

/** Build a case linting `file` inside `p`, with `p.dir` as the scan root. */
function lintCase(
	p: { dir: string; file: (f: string) => string },
	file: string,
	extraOptions: Record<string, unknown> = {}
): { code: string; filename: string; options: unknown[] } {
	const filename = p.file(file);
	return { code: read(filename), filename, options: [{ include: [p.dir], ...extraOptions }] };
}

tester.run(
	'no-useless-props',
	rule as any,
	SUPPORTED
		? {
				valid: [
					// The owner of a call site has no useless prop of its own.
					lintCase(basic, 'App.svelte'),
					// A prop passed via attribute / bind: / body / snippet is "used".
					lintCase(ways, 'App.svelte'),
					// An opaque spread may set any prop, so nothing in the target is flagged.
					lintCase(spread, 'Box.svelte'),
					// A component read as a value escapes — its props are never flagged.
					lintCase(escaped, 'Child.svelte'),
					// A zero-call-site component (entry / route page) is skipped entirely.
					lintCase(entry, 'Page.svelte'),
					// A prop passed by at least one of several call sites is not useless.
					lintCase(multiSite, 'Child.svelte')
				],
				invalid: [
					{
						// `unused` is never passed by any call site; `used` is.
						...lintCase(basic, 'Child.svelte'),
						errors: [{ messageId: 'uselessProp', data: { name: 'unused' }, line: 2 }]
					},
					{
						// Reported by the EXTERNAL name (`gone`); `outer` is passed.
						...lintCase(renamed, 'Renamed.svelte'),
						errors: [{ messageId: 'uselessProp', data: { name: 'gone' }, line: 3 }]
					},
					{
						// attr/bind/body/snippet all count as passed; only `trulyUnused` is dead.
						...lintCase(ways, 'Box.svelte'),
						errors: [{ messageId: 'uselessProp', data: { name: 'trulyUnused' } }]
					},
					{
						// Several dead props are each reported at their own declaration.
						...lintCase(multiple, 'Widget.svelte'),
						errors: [
							{ messageId: 'uselessProp', data: { name: 'deadA' }, line: 4 },
							{ messageId: 'uselessProp', data: { name: 'deadB' }, line: 5 }
						]
					},
					{
						// The `$lib` alias is resolved, so the call site counts and `unused`
						// (never passed) is reported while `used` is not.
						...lintCase(alias, 'lib/Child.svelte', {
							aliases: { $lib: path.join(alias.dir, 'lib') }
						}),
						errors: [{ messageId: 'uselessProp', data: { name: 'unused' } }]
					}
				]
			}
		: { valid: [], invalid: [] }
);
