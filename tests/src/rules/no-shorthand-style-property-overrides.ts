import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-shorthand-style-property-overrides';
import { loadTestCases } from '../../utils/utils';

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
