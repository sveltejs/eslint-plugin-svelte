import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-dynamic-slot-name';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dynamic-slot-name', rule as any, loadTestCases('no-dynamic-slot-name'));
