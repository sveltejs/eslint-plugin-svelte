import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-reactive-functions"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-reactive-functions",
  rule as any,
  loadTestCases("no-reactive-functions"),
)
