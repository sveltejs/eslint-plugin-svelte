import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/sort-attributes.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('sort-attributes', rule as any, loadTestCases('sort-attributes'));
