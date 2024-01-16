import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/max-attributes-per-line';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('max-attributes-per-line', rule as any, loadTestCases('max-attributes-per-line'));
