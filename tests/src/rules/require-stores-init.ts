import { RuleTester } from 'eslint';
import rule from '../../../src/rules/require-stores-init';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('require-stores-init', rule as any, loadTestCases('require-stores-init'));
