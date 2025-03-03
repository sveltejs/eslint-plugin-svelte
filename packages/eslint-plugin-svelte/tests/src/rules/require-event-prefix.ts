import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/require-event-prefix.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('require-event-prefix', rule as any, loadTestCases('require-event-prefix'));
