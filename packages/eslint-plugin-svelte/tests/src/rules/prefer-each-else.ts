import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-each-else.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run('prefer-each-else', rule as any, loadTestCases('prefer-each-else'));
