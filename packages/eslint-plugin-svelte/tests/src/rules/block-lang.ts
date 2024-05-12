import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/block-lang';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('block-lang', rule as any, loadTestCases('block-lang'));
