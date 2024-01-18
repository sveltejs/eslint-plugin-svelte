import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/experimental-require-strict-events';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'experimental-require-strict-events',
	rule as any,
	loadTestCases('experimental-require-strict-events')
);
