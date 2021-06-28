import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-object-in-text-mustaches"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-object-in-text-mustaches",
  rule as any,
  loadTestCases("no-object-in-text-mustaches"),
)
