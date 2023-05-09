import { RuleTester } from "eslint"
import rule from "../../../src/rules/require-each-key"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("require-each-key", rule as any, loadTestCases("require-each-key"))
