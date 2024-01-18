import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-immutable-reactive-statements';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-immutable-reactive-statements',
	rule as any,
	loadTestCases('no-immutable-reactive-statements')
);
