import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-goto-without-base.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-goto-without-base', rule as any, loadTestCases('no-goto-without-base'));
