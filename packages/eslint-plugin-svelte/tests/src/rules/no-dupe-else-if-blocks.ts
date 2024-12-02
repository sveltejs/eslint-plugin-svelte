import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-dupe-else-if-blocks.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dupe-else-if-blocks', rule as any, loadTestCases('no-dupe-else-if-blocks'));
