import { RuleTester } from "eslint"
import rule from "../../../src/rules/component-tags-order"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "component-tags-order",
  rule as any,
  loadTestCases("component-tags-order"),
)
