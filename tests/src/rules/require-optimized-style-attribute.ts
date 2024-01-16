import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-optimized-style-attribute';
import { loadTestCases } from '../../utils/utils';

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
