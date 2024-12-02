import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-each-key.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('require-each-key', rule as any, loadTestCases('require-each-key'));
