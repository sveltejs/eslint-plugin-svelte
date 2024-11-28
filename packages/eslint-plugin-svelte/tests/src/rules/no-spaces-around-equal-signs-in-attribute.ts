import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-spaces-around-equal-signs-in-attribute.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'no-spaces-around-equal-signs-in-attribute',
	rule as any,
	loadTestCases('no-spaces-around-equal-signs-in-attribute')
);
