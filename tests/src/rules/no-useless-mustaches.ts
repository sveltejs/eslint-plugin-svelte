import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-useless-mustaches';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-useless-mustaches', rule as any, loadTestCases('no-useless-mustaches'));
