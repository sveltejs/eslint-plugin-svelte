import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/no-undefined-print';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('no-undefined-print', rule as any, loadTestCases('no-undefined-print'));
