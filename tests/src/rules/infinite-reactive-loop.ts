import { RuleTester } from "eslint"
import rule from "../../../src/rules/infinite-reactive-loop"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  env: {
    browser: true,
    es2022: true,
  },
})

tester.run(
  "infinite-reactive-loop",
  rule as any,
  loadTestCases("infinite-reactive-loop"),
)
