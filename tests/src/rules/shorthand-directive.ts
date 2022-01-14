import { RuleTester } from "eslint"
import rule from "../../../src/rules/shorthand-directive"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "shorthand-directive",
  rule as any,
  loadTestCases("shorthand-directive"),
)
