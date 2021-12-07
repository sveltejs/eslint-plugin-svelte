import { RuleTester, Linter } from "eslint"
import rule from "../../../src/rules/dollar-prefixed-store-uses-vars"

describe("dollar-prefixed-store-uses-vars", () => {
  const ruleNoUnusedVars = new Linter().getRules().get("no-unused-vars")!
  const tester = new RuleTester({
    parser: require.resolve("svelte-eslint-parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  })
  const linter = (tester as any).linter
  linter.defineRule("dollar-prefixed-store-uses-vars", rule)
  tester.run("no-unused-vars", ruleNoUnusedVars, {
    valid: [
      `
      <script>
        /* eslint dollar-prefixed-store-uses-vars: 2 */
        import { a } from "./stores"
        $a = 42
      </script>
      `,
      `
      <script>
        /* eslint dollar-prefixed-store-uses-vars: 2 */
        import { a as b } from "./stores"
        $b = 42
      </script>
      `,
      `
      <script>
        /* eslint dollar-prefixed-store-uses-vars: 2 */
        import a from "./stores"
        $a = 42
      </script>
      `,
      `
      <script>
        /* eslint dollar-prefixed-store-uses-vars: 2 */
        import * as a from "./stores"
        $a = 42
      </script>
      `,
    ],
    invalid: [
      {
        code: `
          <script>
            /* eslint dollar-prefixed-store-uses-vars: 2 */
            import { a } from "./stores"
            $b = 42
          </script>
          `,
        errors: 1,
      },
      {
        code: `
          <script>
            /* eslint dollar-prefixed-store-uses-vars: 2 */
            import { a as b } from "./stores"
            $a = 42
          </script>
          `,
        errors: 1,
      },
      {
        code: `
          <script>
            /* eslint dollar-prefixed-store-uses-vars: 2 */
            import a from "./stores"
            $b = 42
          </script>
          `,
        errors: 1,
      },
      {
        code: `
          <script>
            /* eslint dollar-prefixed-store-uses-vars: 2 */
            import * as a from "./stores"
            $b = 42
          </script>
          `,
        errors: 1,
      },
    ],
  })
})
