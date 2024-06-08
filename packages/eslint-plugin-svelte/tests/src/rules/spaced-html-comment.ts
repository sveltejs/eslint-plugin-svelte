import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/spaced-html-comment';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('spaced-html-comment', rule as any, loadTestCases('spaced-html-comment'));
