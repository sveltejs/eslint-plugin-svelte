import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-immutable-reactive-statements"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-immutable-reactive-statements",
  rule as any,
  loadTestCases("no-immutable-reactive-statements"),
)
