import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-destructured-store-props.js';
import { loadTestCases } from '../../utils/utils.js';

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
