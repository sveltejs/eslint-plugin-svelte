import { RuleTester } from 'eslint';
import rule from '../../../src/rules/button-has-type';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('button-has-type', rule as any, loadTestCases('button-has-type'));
