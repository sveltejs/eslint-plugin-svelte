import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/max-attributes-per-line.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('max-attributes-per-line', rule as any, loadTestCases('max-attributes-per-line'));
