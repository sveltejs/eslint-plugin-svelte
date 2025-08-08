import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/html-self-closing.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('html-self-closing', rule as any, loadTestCases('html-self-closing'));
