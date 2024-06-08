import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-trailing-spaces';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-trailing-spaces', rule as any, loadTestCases('no-trailing-spaces'));
