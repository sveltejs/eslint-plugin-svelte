import { RuleTester } from "eslint"
import rule from "../../../src/rules/valid-context-access"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "valid-context-access",
  rule as any,
  loadTestCases("valid-context-access"),
)
