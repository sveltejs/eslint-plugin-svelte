import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-let.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	},
});

tester.run('prefer-let', rule as any, loadTestCases('prefer-let'));
