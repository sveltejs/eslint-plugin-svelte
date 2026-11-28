import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-store-update-return.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run(
	'require-store-update-return',
	rule as any,
	loadTestCases('require-store-update-return')
);
