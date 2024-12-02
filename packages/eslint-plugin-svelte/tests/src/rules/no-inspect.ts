import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-inspect.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inspect', rule as any, loadTestCases('no-inspect'));
