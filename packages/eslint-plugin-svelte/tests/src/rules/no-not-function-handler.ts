import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-not-function-handler.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-not-function-handler', rule as any, loadTestCases('no-not-function-handler'));
