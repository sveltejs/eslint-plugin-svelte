import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-store-async.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-store-async', rule as any, loadTestCases('no-store-async'));
