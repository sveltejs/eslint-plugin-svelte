import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/experimental-require-slot-types.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'experimental-require-slot-types',
	rule as any,
	loadTestCases('experimental-require-slot-types')
);
