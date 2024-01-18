import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/indent';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			parser: {
				ts: '@typescript-eslint/parser',
				js: 'espree'
			}
		}
	}
});

tester.run('indent', rule as any, loadTestCases('indent'));
