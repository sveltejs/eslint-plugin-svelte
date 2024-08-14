import { RuleTester } from '../../utils/eslint-compat';
import rule from '../../../src/rules/restrict-mustache-expressions';
import { loadTestCases, RULES_PROJECT } from '../../utils/utils';

const tester = new RuleTester({
    languageOptions: {
        parser: "@typescript-eslint/parser",
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
            // parser: '@typescript-eslint/parser',
            projectService: true,
            project: RULES_PROJECT,
        }
    },
});

tester.run('restrict-mustache-expressions', rule as any, loadTestCases('restrict-mustache-expressions'));
