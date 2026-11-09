import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-constant-derived.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run('no-constant-derived', rule as any, loadTestCases('no-constant-derived'));
