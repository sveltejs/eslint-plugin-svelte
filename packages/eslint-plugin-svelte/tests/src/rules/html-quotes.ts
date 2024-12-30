import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/html-quotes.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('html-quotes', rule as any, loadTestCases('html-quotes'));
