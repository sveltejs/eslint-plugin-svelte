import type { Rule } from 'eslint';
import { getCoreRule } from '../../../src/utils/eslint-core';
import { RuleTester } from '../../utils/eslint-compat';

describe('Integration test for no-unused-vars', () => {
	const ruleNoUnusedVars = getCoreRule('no-unused-vars') as unknown as Rule.RuleModule;
	const tester = new RuleTester({
		languageOptions: {
			parser: require('svelte-eslint-parser'),
			ecmaVersion: 2020,
			sourceType: 'module'
		}
	});
	tester.run('no-unused-vars', ruleNoUnusedVars, {
		valid: [
			`
      <script>
        import { a } from "./stores"
        $a = 42
      </script>
      `,
			`
      <script>
        import { a as b } from "./stores"
        $b = 42
      </script>
      `,
			`
      <script>
        import a from "./stores"
        $a = 42
      </script>
      `,
			`
      <script>
        import * as a from "./stores"
        $a = 42
      </script>
      `
		],
		invalid: [
			{
				code: `
          <script>
            import { a } from "./stores"
            $b = 42
          </script>
          `,
				errors: 1
			},
			{
				code: `
          <script>
            import { a as b } from "./stores"
            $a = 42
          </script>
          `,
				errors: 1
			},
			{
				code: `
          <script>
            import a from "./stores"
            $b = 42
          </script>
          `,
				errors: 1
			},
			{
				code: `
          <script>
            import * as a from "./stores"
            $b = 42
          </script>
          `,
				errors: 1
			}
		]
	});
});
