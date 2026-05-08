import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/max-lines-per-block.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module'
	}
});

tester.run('max-lines-per-block', rule as any, loadTestCases('max-lines-per-block'));
