import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/prefer-destructured-store-props';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'prefer-destructured-store-props',
	rule as any,
	loadTestCases('prefer-destructured-store-props')
);
