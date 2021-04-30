import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-at-debug-tags"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("no-at-debug-tags", rule as any, loadTestCases("no-at-debug-tags"))
