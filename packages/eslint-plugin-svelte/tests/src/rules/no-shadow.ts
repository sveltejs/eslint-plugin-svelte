import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-shadow.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-shadow', rule as any, loadTestCases('no-shadow'));
