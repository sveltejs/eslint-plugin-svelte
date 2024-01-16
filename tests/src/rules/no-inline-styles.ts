import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-inline-styles';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inline-styles', rule as any, loadTestCases('no-inline-styles'));
