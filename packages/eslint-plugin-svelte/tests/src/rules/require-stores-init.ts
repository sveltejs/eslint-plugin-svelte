import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-stores-init';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('require-stores-init', rule as any, loadTestCases('require-stores-init'));
