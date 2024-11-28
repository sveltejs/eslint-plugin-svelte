import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/html-closing-bracket-new-line.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'html-closing-bracket-new-line',
	rule as any,
	loadTestCases('html-closing-bracket-new-line')
);
