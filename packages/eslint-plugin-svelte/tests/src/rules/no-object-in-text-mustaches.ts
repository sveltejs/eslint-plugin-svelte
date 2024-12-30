import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-object-in-text-mustaches.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-object-in-text-mustaches',
	rule as any,
	loadTestCases('no-object-in-text-mustaches')
);
