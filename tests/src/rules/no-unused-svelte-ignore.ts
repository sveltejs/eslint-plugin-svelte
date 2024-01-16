import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-unused-svelte-ignore';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-unused-svelte-ignore', rule as any, loadTestCases('no-unused-svelte-ignore'));
