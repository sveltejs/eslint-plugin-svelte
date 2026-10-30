import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/sort-scripts-elements.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('sort-scripts-elements', rule as any, loadTestCases('sort-scripts-elements'));
