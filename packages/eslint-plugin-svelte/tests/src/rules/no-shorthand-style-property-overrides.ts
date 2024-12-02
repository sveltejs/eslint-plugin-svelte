import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-shorthand-style-property-overrides.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-shorthand-style-property-overrides',
	rule as any,
	loadTestCases('no-shorthand-style-property-overrides')
);
