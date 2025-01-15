import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/consistent-selector-style';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('consistent-selector-style', rule as any, loadTestCases('consistent-selector-style'));
