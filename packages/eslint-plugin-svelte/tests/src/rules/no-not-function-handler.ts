import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-not-function-handler';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-not-function-handler', rule as any, loadTestCases('no-not-function-handler'));
