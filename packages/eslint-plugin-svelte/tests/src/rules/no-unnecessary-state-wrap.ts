import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-unnecessary-state-wrap.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('no-unnecessary-state-wrap', rule as any, loadTestCases('no-unnecessary-state-wrap'));
