import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-svelte-reactivity.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('prefer-svelte-reactivity', rule as any, loadTestCases('prefer-svelte-reactivity'));
