import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-deprecated-raw-special-elements.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-deprecated-raw-special-elements',
	rule as any,
	loadTestCases('no-deprecated-raw-special-elements')
);
