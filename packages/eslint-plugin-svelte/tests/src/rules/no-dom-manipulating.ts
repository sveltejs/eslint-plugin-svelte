import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-dom-manipulating.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dom-manipulating', rule as any, loadTestCases('no-dom-manipulating'));
