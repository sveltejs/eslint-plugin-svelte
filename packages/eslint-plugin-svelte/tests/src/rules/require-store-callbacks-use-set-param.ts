import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-store-callbacks-use-set-param';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'require-store-callbacks-use-set-param',
	rule as any,
	loadTestCases('require-store-callbacks-use-set-param')
);
