import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-dynamic-slot-name.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dynamic-slot-name', rule as any, loadTestCases('no-dynamic-slot-name'));
