import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-loss-of-prop-reactivity"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-loss-of-prop-reactivity",
  rule as any,
  loadTestCases("no-loss-of-prop-reactivity"),
)
