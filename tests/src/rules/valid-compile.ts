import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/valid-compile';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			parser: '@typescript-eslint/parser'
		}
	}
});

tester.run('valid-compile', rule as any, loadTestCases('valid-compile'));
