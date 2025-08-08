import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/html-closing-bracket-spacing.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion:"latest",
		sourceType: 'module'
	}
});

tester.run(
	'html-closing-bracket-spacing',
	rule as any,
	loadTestCases('html-closing-bracket-spacing')
);
