import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-unused-props.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-unused-props', rule as any, loadTestCases('no-unused-props'));
