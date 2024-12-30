import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/indent.js';
import { loadTestCases } from '../../utils/utils.js';

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
