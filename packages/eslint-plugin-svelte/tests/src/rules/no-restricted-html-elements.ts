import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-restricted-html-elements';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-restricted-html-elements',
	rule as any,
	loadTestCases('no-restricted-html-elements')
);
