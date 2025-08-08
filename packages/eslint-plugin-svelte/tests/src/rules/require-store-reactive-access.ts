import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-store-reactive-access.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run(
	'require-store-reactive-access',
	rule as any,
	loadTestCases('require-store-reactive-access')
);
