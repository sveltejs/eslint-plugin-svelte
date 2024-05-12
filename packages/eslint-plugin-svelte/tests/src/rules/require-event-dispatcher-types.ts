import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/require-event-dispatcher-types';
import { loadTestCases } from '../../utils/utils';

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
