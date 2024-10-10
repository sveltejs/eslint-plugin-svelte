import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-inspect';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inspect', rule as any, loadTestCases('no-inspect'));
