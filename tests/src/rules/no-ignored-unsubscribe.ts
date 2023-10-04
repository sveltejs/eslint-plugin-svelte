import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-ignored-unsubscribe';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-ignored-unsubscribe', rule as any, loadTestCases('no-ignored-unsubscribe'));
