import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-at-debug-tags.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-at-debug-tags', rule as any, loadTestCases('no-at-debug-tags'));
