import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-raw-special-elements.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run(
	'no-raw-special-elements',
	rule as any,
	loadTestCases('no-raw-special-elements')
);
