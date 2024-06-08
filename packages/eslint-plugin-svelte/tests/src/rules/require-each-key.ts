import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-each-key';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('require-each-key', rule as any, loadTestCases('require-each-key'));
