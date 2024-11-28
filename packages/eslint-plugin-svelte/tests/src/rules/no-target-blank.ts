import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-target-blank.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-target-blank', rule as any, loadTestCases('no-target-blank'));
