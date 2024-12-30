import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-immutable-reactive-statements.js';
import { loadTestCases } from '../../utils/utils.js';

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
