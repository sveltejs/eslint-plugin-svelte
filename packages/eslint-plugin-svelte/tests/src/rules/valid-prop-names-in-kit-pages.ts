import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/valid-prop-names-in-kit-pages.js';
import { loadTestCases } from '../../utils/utils.js';

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
