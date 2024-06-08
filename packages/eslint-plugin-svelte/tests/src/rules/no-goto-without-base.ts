import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-goto-without-base';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-goto-without-base', rule as any, loadTestCases('no-goto-without-base'));
