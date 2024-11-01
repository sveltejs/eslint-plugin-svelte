import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-navigation-without-base';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-navigation-without-base', rule as any, loadTestCases('no-navigation-without-base'));
