import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-ignored-unsubscribe';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-ignored-unsubscribe', rule as any, loadTestCases('no-ignored-unsubscribe'));
