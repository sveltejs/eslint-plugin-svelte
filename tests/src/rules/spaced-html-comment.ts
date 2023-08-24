import { RuleTester } from 'eslint';
import rule from '../../../src/rules/spaced-html-comment';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('spaced-html-comment', rule as any, loadTestCases('spaced-html-comment'));
