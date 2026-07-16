import { RuleTester } from '../../utils/eslint-compat.js';
import rule from '../../../src/rules/no-bind-value-on-checkable-inputs.js';
import { loadTestCases } from '../../utils/utils.js';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion:"latest",
        sourceType: 'module'
    }
});

tester.run('no-bind-value-on-checkable-inputs', rule as any, loadTestCases('no-bind-value-on-checkable-inputs'));
