import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/button-has-type.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('button-has-type', rule as any, loadTestCases('button-has-type'));
