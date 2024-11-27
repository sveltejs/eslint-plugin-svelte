import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-deprecated-raw-special-elements';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-deprecated-raw-special-elements', rule as any, loadTestCases('no-deprecated-raw-special-elements'));
