import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-unused-class-name';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-unused-class-name', rule as any, loadTestCases('no-unused-class-name'));
