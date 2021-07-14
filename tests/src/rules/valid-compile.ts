import { RuleTester } from "eslint"
import rule from "../../../src/rules/valid-compile"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parser: {
      ts: "@typescript-eslint/parser",
      js: "espree",
    },
  },
})

tester.run("valid-compile", rule as any, loadTestCases("valid-compile"))
