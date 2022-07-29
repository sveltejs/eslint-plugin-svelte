import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-extra-reactive-curlies"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-extra-reactive-curlies",
  rule as any,
  loadTestCases("no-extra-reactive-curlies"),
)
