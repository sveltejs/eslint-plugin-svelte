import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-store-reactive-access';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'require-store-reactive-access',
	rule as any,
	loadTestCases('require-store-reactive-access')
);
