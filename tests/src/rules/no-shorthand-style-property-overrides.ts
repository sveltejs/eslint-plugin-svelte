import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-shorthand-style-property-overrides';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-shorthand-style-property-overrides',
	rule as any,
	loadTestCases('no-shorthand-style-property-overrides')
);
