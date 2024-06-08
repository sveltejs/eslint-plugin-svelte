import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-target-blank';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-target-blank', rule as any, loadTestCases('no-target-blank'));
