import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-dupe-on-directives"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-dupe-on-directives",
  rule as any,
  loadTestCases("no-dupe-on-directives"),
)
