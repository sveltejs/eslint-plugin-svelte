import { RuleTester } from 'eslint';
import rule from '../../../src/rules/derived-has-same-inputs-outputs';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run(
	'derived-has-same-inputs-outputs',
	rule as any,
	loadTestCases('derived-has-same-inputs-outputs')
);
