import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-derived-over-derived-by.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run(
	'prefer-derived-over-derived-by',
	rule as any,
	loadTestCases('prefer-derived-over-derived-by')
);
