import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/mustache-spacing';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('mustache-spacing', rule as any, loadTestCases('mustache-spacing'));
