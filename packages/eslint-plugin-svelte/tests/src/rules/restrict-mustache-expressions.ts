import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/restrict-mustache-expressions';
import { loadTestCases } from '../../utils/utils';

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    }
});

tester.run('restrict-mustache-expressions', rule as any, loadTestCases('restrict-mustache-expressions'));
