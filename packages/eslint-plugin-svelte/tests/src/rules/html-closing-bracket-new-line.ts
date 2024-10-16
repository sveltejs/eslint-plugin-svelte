import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/html-closing-bracket-new-line';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('html-closing-bracket-new-line', rule as any, loadTestCases('html-closing-bracket-new-line'));
