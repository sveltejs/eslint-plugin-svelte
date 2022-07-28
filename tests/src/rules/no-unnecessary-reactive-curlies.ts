import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-unnecessary-reactive-curlies"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-unnecessary-reactive-curlies",
  rule as any,
  loadTestCases("no-unnecessary-reactive-curlies"),
)
