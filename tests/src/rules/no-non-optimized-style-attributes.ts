import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-non-optimized-style-attributes"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-non-optimized-style-attributes",
  rule as any,
  loadTestCases("no-non-optimized-style-attributes"),
)
