import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/spaced-html-comment.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('spaced-html-comment', rule as any, loadTestCases('spaced-html-comment'));
