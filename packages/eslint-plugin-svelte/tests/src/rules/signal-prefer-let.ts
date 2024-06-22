import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/signal-prefer-let';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('signal-prefer-let', rule as any, loadTestCases('signal-prefer-let'));
