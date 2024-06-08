import { RuleTester } from '../../../utils/eslint-compat';
import rule from '../../../../src/rules/@typescript-eslint/no-unnecessary-condition';
import { loadTestCases, RULES_PROJECT } from '../../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		parserOptions: {
			parser: {
				ts: '@typescript-eslint/parser',
				js: 'espree'
			},
			project: RULES_PROJECT
		}
	}
});

tester.run(
	'@typescript-eslint/no-unnecessary-condition',
	rule as any,
	loadTestCases('@typescript-eslint/no-unnecessary-condition')
);
