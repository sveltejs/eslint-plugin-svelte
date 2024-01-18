import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/valid-prop-names-in-kit-pages';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'valid-prop-names-in-kit-pages',
	rule as any,
	loadTestCases('valid-prop-names-in-kit-pages')
);
