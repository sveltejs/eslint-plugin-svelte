import assert from 'assert';
import path from 'path';
import { fileURLToPath } from 'url';
import { RuleTester } from '../utils/eslint-compat.js';
import { loadTestCases } from '../utils/utils.js';
import rule from '../../src/rules/no-at-html-tags.js';

describe('Fixture test names', () => {
	it('shows relative fixture paths in RuleTester test titles', () => {
		const cases = loadTestCases('no-at-html-tags');
		const names: string[] = [];
		const originalDescribe = RuleTester.describe;
		const originalIt = RuleTester.it;
		try {
			RuleTester.describe = (_name, callback) => callback();
			RuleTester.it = (name) => {
				names.push(name);
			};
			new RuleTester().run('no-at-html-tags', rule as any, cases);
		} finally {
			RuleTester.describe = originalDescribe;
			RuleTester.it = originalIt;
		}
		const fixtureRoot = new URL('../fixtures/rules/', import.meta.url);
		const expected = [...cases.valid, ...cases.invalid].map((test) =>
			path.relative(fileURLToPath(fixtureRoot), test.filename!)
		);
		assert.deepStrictEqual(names, expected);
	});
});
