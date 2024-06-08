import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-reactive-functions';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-functions', rule as any, loadTestCases('no-reactive-functions'));
