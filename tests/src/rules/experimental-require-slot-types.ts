import { RuleTester } from "eslint"
import rule from "../../../src/rules/experimental-require-slot-types"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "experimental-require-slot-types",
  rule as any,
  loadTestCases("experimental-require-slot-types"),
)
