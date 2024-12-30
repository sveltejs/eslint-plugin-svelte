import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-unknown-style-directive-property.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-unknown-style-directive-property',
	rule as any,
	loadTestCases('no-unknown-style-directive-property')
);
