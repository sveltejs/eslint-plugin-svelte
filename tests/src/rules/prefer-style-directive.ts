import { RuleTester } from "eslint"
import rule from "../../../src/rules/prefer-style-directive"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "prefer-style-directive",
  rule as any,
  loadTestCases("prefer-style-directive"),
)
