import { ESLintUtils } from "@typescript-eslint/utils"
import * as path from "path"

function getFixturesRootDir(): string {
  return path.join(__dirname, "fixtures")
}

const {
  batchedSingleLineTests,
  // eslint-disable-next-line @typescript-eslint/naming-convention -- original name
  RuleTester,
  noFormat,
} = ESLintUtils

export { batchedSingleLineTests, getFixturesRootDir, noFormat, RuleTester }
