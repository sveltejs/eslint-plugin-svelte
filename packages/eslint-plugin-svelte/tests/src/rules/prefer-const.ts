import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/prefer-const';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
});

tester.run('prefer-const', rule as any, loadTestCases('prefer-const'));
