import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/shorthand-directive';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('shorthand-directive', rule as any, loadTestCases('shorthand-directive'));
