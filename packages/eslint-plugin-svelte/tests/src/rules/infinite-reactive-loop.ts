import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/infinite-reactive-loop.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('infinite-reactive-loop', rule as any, loadTestCases('infinite-reactive-loop'));
