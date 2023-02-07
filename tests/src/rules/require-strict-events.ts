import { RuleTester } from "eslint"
import rule from "../../../src/rules/require-strict-events"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "require-strict-events",
  rule as any,
  loadTestCases("experimental-require-strict-events"),
)
