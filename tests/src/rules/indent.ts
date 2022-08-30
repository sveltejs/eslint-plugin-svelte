import { RuleTester } from "eslint"
import path from "path"
import rule from "../../../src/rules/indent"
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

tester.run("indent", rule as any, loadTestCases("indent"))

const testerForTsParserV4 = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    parser: {
      ts: "@typescript-eslint/parser-v4",
      js: "espree",
    },
  },
})

describe("use @typescript-eslint/parser@4", () => {
  testerForTsParserV4.run(
    "indent",
    rule as any,
    loadTestCases("indent", {
      filter(filename) {
        if (
          filename.endsWith("ts-class03-input.svelte") ||
          filename.endsWith("ts-decorator01-input.svelte") ||
          filename.endsWith("ts-decorator02-input.svelte")
        ) {
          // Decorator nodes in ts4.8 are incompatible.
          return false
        }

        return path.basename(path.dirname(filename)) === "ts"
      },
    }),
  )
})
