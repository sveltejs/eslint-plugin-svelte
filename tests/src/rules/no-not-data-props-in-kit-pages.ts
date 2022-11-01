import { RuleTester } from "eslint"
import rule from "../../../src/rules/no-not-data-props-in-kit-pages"
import { loadTestCases } from "../../utils/utils"

const tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
})

tester.run(
  "no-not-data-props-in-kit-pages",
  rule as any,
  loadTestCases("no-not-data-props-in-kit-pages"),
)
