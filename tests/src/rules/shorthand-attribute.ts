import { RuleTester } from 'eslint';
import rule from '../../../src/rules/shorthand-attribute';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module'
	}
});

tester.run('shorthand-attribute', rule as any, loadTestCases('shorthand-attribute'));
