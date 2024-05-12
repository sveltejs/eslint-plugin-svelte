import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-dupe-on-directives';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-dupe-on-directives', rule as any, loadTestCases('no-dupe-on-directives'));
