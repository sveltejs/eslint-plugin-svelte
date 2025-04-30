import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-writable-derived.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('prefer-writable-derived', rule as any, loadTestCases('prefer-writable-derived'));
