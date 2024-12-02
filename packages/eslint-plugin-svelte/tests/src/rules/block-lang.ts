import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/block-lang.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('block-lang', rule as any, loadTestCases('block-lang'));
