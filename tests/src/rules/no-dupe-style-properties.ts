import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-dupe-style-properties"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-dupe-style-properties",
  rule as any,
  loadTestCases("no-dupe-style-properties"),
)
