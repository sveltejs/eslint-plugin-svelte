import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadESLint, type ESLint as ESLintClass } from 'eslint';
import plugin from '../../../src/index.js';

const bad = `<script>
  import { goto } from '$app/navigation';
  const go = () => goto('/login');
</script>
<a href="/login">Bad</a>
<button onclick={go}>Bad</button>`;
const good = `<script>
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  const go = () => goto(resolve('/login'));
</script>
<a href={resolve('/login')}>Good</a>
<a href="https://svelte.dev">External</a>
<a href="#top">Fragment</a>
<button onclick={go}>Good</button>`;

describe('SvelteKit navigation version conditions', () => {
	let ESLint: typeof ESLintClass;
	let root: string;

	before(async () => {
		ESLint = await loadESLint({ useFlatConfig: true });
		root = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-plugin-svelte-navigation-'));
	});

	after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});

	for (const version of ['1.30.4', '2.62.0', '3.0.0', '3.0.0-next.1', '3.0.0-rc.1']) {
		it(`reports unresolved navigation with the recommended config on Kit ${version}`, async () => {
			const project = path.join(root, version);
			fs.mkdirSync(project);
			fs.writeFileSync(
				path.join(project, 'package.json'),
				JSON.stringify({ devDependencies: { '@sveltejs/kit': version } })
			);
			const linter = new ESLint({
				cwd: project,
				overrideConfigFile: true,
				overrideConfig: plugin.configs.recommended
			});
			const config = await linter.calculateConfigForFile(
				path.join(project, 'src/routes/+page.svelte')
			);
			assert.strictEqual(config.rules['svelte/no-navigation-without-resolve'][0], 2);
			const [badResult] = await linter.lintText(bad, { filePath: 'src/routes/+page.svelte' });
			assert.deepStrictEqual(
				badResult.messages.map(({ ruleId, messageId }) => ({ ruleId, messageId })),
				[
					{ ruleId: 'svelte/no-navigation-without-resolve', messageId: 'gotoWithoutResolve' },
					{ ruleId: 'svelte/no-navigation-without-resolve', messageId: 'linkWithoutResolve' }
				]
			);
			const [goodResult] = await linter.lintText(good, { filePath: 'src/routes/+page.svelte' });
			assert.deepStrictEqual(goodResult.messages, []);

			const legacyLinter = new ESLint({
				cwd: project,
				overrideConfigFile: true,
				overrideConfig: [
					...plugin.configs.base,
					{
						rules: {
							'svelte/no-goto-without-base': 'error',
							'svelte/no-navigation-without-base': 'error'
						}
					}
				]
			});
			const [legacyResult] = await legacyLinter.lintText(bad, {
				filePath: 'src/routes/legacy.svelte'
			});
			if (version.startsWith('3.')) {
				assert.deepStrictEqual(legacyResult.messages, []);
			} else {
				assert.deepStrictEqual(
					[...new Set(legacyResult.messages.map(({ ruleId }) => ruleId))].sort(),
					['svelte/no-goto-without-base', 'svelte/no-navigation-without-base']
				);
			}
		});
	}
});
