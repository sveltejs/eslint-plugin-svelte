import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/sort-props.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run('sort-props', rule as any, loadTestCases('sort-props'));
