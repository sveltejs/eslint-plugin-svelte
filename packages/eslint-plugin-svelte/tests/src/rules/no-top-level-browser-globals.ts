import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-top-level-browser-globals.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run(
	'no-top-level-browser-globals',
	rule as any,
	loadTestCases('no-top-level-browser-globals')
);
