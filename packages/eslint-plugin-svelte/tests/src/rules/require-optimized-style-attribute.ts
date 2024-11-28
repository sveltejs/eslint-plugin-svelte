import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-optimized-style-attribute.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'require-optimized-style-attribute',
	rule as any,
	loadTestCases('require-optimized-style-attribute')
);
