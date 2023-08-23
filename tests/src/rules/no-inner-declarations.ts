import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-inner-declarations';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inner-declarations', rule as any, loadTestCases('no-inner-declarations'));
