import { RuleTester } from "eslint"
import rule from "../../../src/rules/block-lang"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("block-lang", rule as any, loadTestCases("block-lang"))
