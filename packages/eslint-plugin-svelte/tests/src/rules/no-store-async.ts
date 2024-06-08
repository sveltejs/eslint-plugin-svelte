import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-store-async';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-store-async', rule as any, loadTestCases('no-store-async'));
