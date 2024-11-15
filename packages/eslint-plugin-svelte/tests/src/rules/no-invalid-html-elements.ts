import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-invalid-html-elements';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-invalid-html-elements', rule as any, loadTestCases('no-invalid-html-elements'));
