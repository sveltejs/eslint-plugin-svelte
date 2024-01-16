import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-reactive-reassign';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-reassign', rule as any, loadTestCases('no-reactive-reassign'));
