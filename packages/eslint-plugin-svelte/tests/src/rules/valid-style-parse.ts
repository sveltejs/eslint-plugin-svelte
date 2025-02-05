import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/valid-style-parse.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('valid-style-parse', rule as any, loadTestCases('valid-style-parse'));
