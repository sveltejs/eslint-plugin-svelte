import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-dupe-use-directives"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-dupe-use-directives",
  rule as any,
  loadTestCases("no-dupe-use-directives"),
)
