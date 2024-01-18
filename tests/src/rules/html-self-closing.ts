import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/html-self-closing';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('html-self-closing', rule as any, loadTestCases('html-self-closing'));
