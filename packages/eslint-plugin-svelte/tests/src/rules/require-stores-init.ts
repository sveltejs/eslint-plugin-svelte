import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-stores-init.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('require-stores-init', rule as any, loadTestCases('require-stores-init'));
