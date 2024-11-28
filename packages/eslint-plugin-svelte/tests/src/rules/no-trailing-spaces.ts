import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-trailing-spaces.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-trailing-spaces', rule as any, loadTestCases('no-trailing-spaces'));
