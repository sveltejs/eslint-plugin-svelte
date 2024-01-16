import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/html-closing-bracket-spacing';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'html-closing-bracket-spacing',
	rule as any,
	loadTestCases('html-closing-bracket-spacing')
);
