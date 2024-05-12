import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/valid-each-key';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('valid-each-key', rule as any, loadTestCases('valid-each-key'));
