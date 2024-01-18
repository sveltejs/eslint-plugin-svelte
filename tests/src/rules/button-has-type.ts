import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/button-has-type';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('button-has-type', rule as any, loadTestCases('button-has-type'));
