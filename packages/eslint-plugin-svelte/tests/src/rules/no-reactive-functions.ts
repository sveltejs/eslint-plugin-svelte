import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-reactive-functions.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-functions', rule as any, loadTestCases('no-reactive-functions'));
