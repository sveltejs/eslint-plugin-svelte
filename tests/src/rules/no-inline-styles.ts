import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-inline-styles';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inline-styles', rule as any, loadTestCases('no-inline-styles'));
