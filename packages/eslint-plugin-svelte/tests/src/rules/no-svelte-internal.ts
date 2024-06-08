import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-svelte-internal';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-svelte-internal', rule as any, loadTestCases('no-svelte-internal'));
