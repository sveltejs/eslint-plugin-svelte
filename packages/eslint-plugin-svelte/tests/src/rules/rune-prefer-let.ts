import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/rune-prefer-let';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('rune-prefer-let', rule as any, loadTestCases('rune-prefer-let'));
