import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-dom-manipulating';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dom-manipulating', rule as any, loadTestCases('no-dom-manipulating'));
