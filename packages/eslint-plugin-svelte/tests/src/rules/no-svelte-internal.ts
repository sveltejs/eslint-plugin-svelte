import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-svelte-internal.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-svelte-internal', rule as any, loadTestCases('no-svelte-internal'));
