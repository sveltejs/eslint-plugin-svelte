import { RuleTester } from "eslint"
import rule from "../../../src/rules/require-store-reactive-access"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "require-store-reactive-access",
  rule as any,
  loadTestCases("require-store-reactive-access"),
)
