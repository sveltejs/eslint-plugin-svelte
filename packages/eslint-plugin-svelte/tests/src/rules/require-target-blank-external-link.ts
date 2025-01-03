import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-target-blank-external-link.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'require-target-blank-external-link',
	rule as any,
	loadTestCases('require-target-blank-external-link')
);
