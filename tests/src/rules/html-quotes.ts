import { RuleTester } from "eslint"
import rule from "../../../src/rules/html-quotes"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("html-quotes", rule as any, loadTestCases("html-quotes"))
