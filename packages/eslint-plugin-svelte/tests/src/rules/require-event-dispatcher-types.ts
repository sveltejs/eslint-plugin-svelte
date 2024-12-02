import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-event-dispatcher-types.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'require-event-dispatcher-types',
	rule as any,
	loadTestCases('require-event-dispatcher-types')
);
