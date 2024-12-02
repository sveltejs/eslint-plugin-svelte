import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/shorthand-directive.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('shorthand-directive', rule as any, loadTestCases('shorthand-directive'));
