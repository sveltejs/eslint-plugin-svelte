import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-component-import-rename.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run('no-component-import-rename', rule as any, loadTestCases('no-component-import-rename'));
