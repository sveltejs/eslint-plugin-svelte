import { RuleTester } from "eslint"
import rule from "../../../src/rules/mustache-spacing"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("mustache-spacing", rule as any, loadTestCases("mustache-spacing"))
