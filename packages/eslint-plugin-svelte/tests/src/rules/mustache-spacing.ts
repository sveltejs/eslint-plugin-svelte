import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/mustache-spacing.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('mustache-spacing', rule as any, loadTestCases('mustache-spacing'));
