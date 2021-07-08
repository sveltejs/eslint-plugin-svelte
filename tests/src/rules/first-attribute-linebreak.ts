import { RuleTester } from "eslint"
import rule from "../../../src/rules/first-attribute-linebreak"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "first-attribute-linebreak",
  rule as any,
  loadTestCases("first-attribute-linebreak"),
)
