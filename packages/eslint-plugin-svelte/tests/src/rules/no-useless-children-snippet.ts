import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-useless-children-snippet';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-useless-children-snippet', rule as any, loadTestCases('no-useless-children-snippet'));
