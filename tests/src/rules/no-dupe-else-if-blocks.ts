import { RuleTester } from 'eslint';
import rule from '../../../src/rules/no-dupe-else-if-blocks';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dupe-else-if-blocks', rule as any, loadTestCases('no-dupe-else-if-blocks'));
