import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-reactive-reassign';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-reactive-reassign', rule as any, loadTestCases('no-reactive-reassign'));
