import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-not-function-handler"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-not-function-handler",
  rule as any,
  loadTestCases("no-not-function-handler"),
)
