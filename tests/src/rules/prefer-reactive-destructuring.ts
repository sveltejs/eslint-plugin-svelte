import { RuleTester } from "eslint"
import rule from "../../../src/rules/prefer-reactive-destructuring"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "prefer-reactive-destructuring",
  rule as any,
  loadTestCases("prefer-reactive-destructuring"),
)
