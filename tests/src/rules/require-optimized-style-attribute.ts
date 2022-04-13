import { RuleTester } from "eslint"
import rule from "../../../src/rules/require-optimized-style-attribute"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "require-optimized-style-attribute",
  rule as any,
  loadTestCases("require-optimized-style-attribute"),
)
