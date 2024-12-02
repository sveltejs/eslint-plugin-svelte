import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-inner-declarations.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-inner-declarations', rule as any, loadTestCases('no-inner-declarations'));
