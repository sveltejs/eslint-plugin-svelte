import { RuleTester } from "eslint"
import rule from "../../../src/rules/indent"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run("indent", rule as any, loadTestCases("indent"))
