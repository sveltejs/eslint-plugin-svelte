import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-spaces-around-equal-signs-in-attribute"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-spaces-around-equal-signs-in-attribute",
  rule as any,
  loadTestCases("no-spaces-around-equal-signs-in-attribute"),
)
