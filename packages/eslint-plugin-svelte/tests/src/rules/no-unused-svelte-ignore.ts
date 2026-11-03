import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { VERSION as SVELTE_VERSION } from 'svelte/compiler';
import semver from 'semver';
import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-unused-svelte-ignore.js';
import { RUNTIME_WARNING_CODES } from '../../../src/shared/svelte-compile-warns/ignore-comment.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('no-unused-svelte-ignore', rule as any, loadTestCases('no-unused-svelte-ignore'));

describe('no-unused-svelte-ignore: RUNTIME_WARNING_CODES', () => {
	it('should match IGNORABLE_RUNTIME_WARNINGS in the Svelte compiler', function () {
		if (!semver.satisfies(SVELTE_VERSION, '>=5')) {
			this.skip();
		}
		const require = createRequire(import.meta.url);
		const constants = fs.readFileSync(
			path.join(path.dirname(require.resolve('svelte/package.json')), 'src/constants.js'),
			'utf8'
		);
		const list = /IGNORABLE_RUNTIME_WARNINGS\s*=[^[]*\[([^\]]*)\]/u.exec(constants)?.[1];
		assert.ok(list, 'IGNORABLE_RUNTIME_WARNINGS not found in svelte/src/constants.js');
		const codes = [...list.matchAll(/'([^']+)'/gu)].map((m) => m[1]);
		assert.deepStrictEqual([...RUNTIME_WARNING_CODES].sort(), codes.sort());
	});
});
