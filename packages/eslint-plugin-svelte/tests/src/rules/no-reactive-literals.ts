import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-reactive-literals';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-literals', rule as any, loadTestCases('no-reactive-literals'));
