import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/infinite-reactive-loop';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('infinite-reactive-loop', rule as any, loadTestCases('infinite-reactive-loop'));
