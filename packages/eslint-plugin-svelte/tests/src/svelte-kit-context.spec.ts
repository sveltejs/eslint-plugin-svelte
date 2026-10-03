import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';
import * as svelteParser from 'svelte-eslint-parser';
import { createRule } from '../../src/utils/index.js';
import { getSvelteContext, type SvelteContext } from '../../src/utils/svelte-context.js';

// Use independent project roots so the plugin's own Kit 2 fallback and caches
// cannot hide version detection regressions.
describe('SvelteKit context', () => {
	let ESLint: typeof ESLintClass;
	let root: string;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-svelte-kit-'));
	});
	after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	for (const [version, expected] of [
		['1.0.0-next.100', '1.0.0-next'],
		['1.30.4', '1'],
		['2.62.0', '2'],
		['3.0.0', '3'],
		['3.0.0-next.1', '3'],
		['3.0.0-rc.1', '3']
	] as const) {
		for (const installed of [false, true]) {
			it(`detects ${version} from ${installed ? 'installed package' : 'dependency range'}`, async () => {
				const project = path.join(root, `${version}-${installed}`);
				fs.mkdirSync(project);
				fs.writeFileSync(
					path.join(project, 'package.json'),
					JSON.stringify({
						devDependencies: { '@sveltejs/kit': installed ? '^2.0.0' : `^${version}` }
					})
				);
				if (installed) {
					const kit = path.join(project, 'node_modules/@sveltejs/kit');
					fs.mkdirSync(kit, { recursive: true });
					fs.writeFileSync(path.join(kit, 'package.json'), JSON.stringify({ version }));
				}

				const actual: { value: SvelteContext | null } = { value: null };
				const rule = createRule('kit-context', {
					meta: {
						docs: { description: 'test context', category: 'SvelteKit', recommended: false },
						type: 'problem',
						schema: [],
						messages: {},
						conditions: [{ svelteKitVersions: [expected] }]
					},
					create(context) {
						actual.value = getSvelteContext(context);
						return {};
					}
				});
				const linter = new ESLint({
					cwd: project,
					overrideConfigFile: true,
					overrideConfig: {
						files: ['**/*.svelte'],
						languageOptions: { parser: svelteParser },
						plugins: { test: { rules: { 'kit-context': rule as never } } },
						rules: { 'test/kit-context': 'error' }
					}
				});
				const [result] = await linter.lintText('<h1>Hello</h1>', {
					filePath: 'src/routes/+page.svelte'
				});
				assert.deepStrictEqual(result.messages, []);
				assert.strictEqual(actual.value?.svelteKitVersion, expected);
				assert.strictEqual(actual.value?.svelteKitFileType, '+page.svelte');
			});
		}
	}
});
