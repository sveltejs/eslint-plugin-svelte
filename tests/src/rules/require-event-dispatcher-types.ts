import { RuleTester } from "eslint"
import rule from "../../../src/rules/require-event-dispatcher-types"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "require-event-dispatcher-types",
  rule as any,
  loadTestCases("require-event-dispatcher-types"),
)
