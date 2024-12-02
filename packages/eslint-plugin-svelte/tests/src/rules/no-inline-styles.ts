import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-inline-styles.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inline-styles', rule as any, loadTestCases('no-inline-styles'));
