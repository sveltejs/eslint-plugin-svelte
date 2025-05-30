import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-add-event-listener.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-add-event-listener', rule as any, loadTestCases('no-add-event-listener'));
