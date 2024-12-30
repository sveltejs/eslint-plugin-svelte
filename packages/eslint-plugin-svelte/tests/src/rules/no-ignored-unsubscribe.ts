import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-ignored-unsubscribe.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-ignored-unsubscribe', rule as any, loadTestCases('no-ignored-unsubscribe'));
