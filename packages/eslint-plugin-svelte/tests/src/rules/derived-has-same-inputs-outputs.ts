import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/derived-has-same-inputs-outputs.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'derived-has-same-inputs-outputs',
	rule as any,
	loadTestCases('derived-has-same-inputs-outputs')
);
