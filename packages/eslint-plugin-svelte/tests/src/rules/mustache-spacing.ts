import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/mustache-spacing.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('mustache-spacing', rule as any, loadTestCases('mustache-spacing'));
