import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-reactive-literals.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-literals', rule as any, loadTestCases('no-reactive-literals'));
