import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-target-blank';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-target-blank', rule as any, loadTestCases('no-target-blank'));
