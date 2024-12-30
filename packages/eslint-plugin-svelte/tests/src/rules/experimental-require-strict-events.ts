import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/experimental-require-strict-events.js';
import { loadTestCases } from '../../utils/utils.js';

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
