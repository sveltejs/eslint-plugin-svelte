import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-extra-reactive-curlies.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-extra-reactive-curlies', rule as any, loadTestCases('no-extra-reactive-curlies'));
