import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-unknown-style-directive-property"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-unknown-style-directive-property",
  rule as any,
  loadTestCases("no-unknown-style-directive-property"),
)
