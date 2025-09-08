import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-navigation-without-resolve';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: "latest",
		sourceType: 'module'
	}
});

tester.run('no-navigation-without-resolve', rule as any, loadTestCases('no-navigation-without-resolve'));
