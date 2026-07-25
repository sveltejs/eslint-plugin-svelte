import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/prefer-attribute-interpolation.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run(
	'prefer-attribute-interpolation',
	rule as any,
	loadTestCases('prefer-attribute-interpolation')
);
