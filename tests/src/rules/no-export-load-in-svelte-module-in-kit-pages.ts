import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-export-load-in-svelte-module-in-kit-pages';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-export-load-in-svelte-module-in-kit-pages',
	rule as any,
	loadTestCases('no-export-load-in-svelte-module-in-kit-pages')
);
