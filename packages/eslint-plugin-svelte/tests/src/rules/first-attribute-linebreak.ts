import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/first-attribute-linebreak.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run('first-attribute-linebreak', rule as any, loadTestCases('first-attribute-linebreak'));
