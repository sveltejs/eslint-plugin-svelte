import fs from "fs"
import path from "path"
import type { RuleTester } from "eslint"
import { Linter } from "eslint"
// @ts-expect-error for test
import { SourceCodeFixer } from "eslint/lib/linter"
import * as svelteESLintParser from "svelte-eslint-parser"
// eslint-disable-next-line @typescript-eslint/no-require-imports -- tests
import plugin = require("../../src/index")

/**
 * Prevents leading spaces in a multiline template literal from appearing in the resulting string
 */
export function unIndent(strings: readonly string[]): string {
  const templateValue = strings[0]
  const lines = templateValue.split("\n")
  const minLineIndent = getMinIndent(lines)

  return lines.map((line) => line.slice(minLineIndent)).join("\n")
}

/**
 * for `code` and `output`
 */
export function unIndentCodeAndOutput([code]: readonly string[]): (
  args: readonly string[],
) => {
  code: string
  output: string
} {
  const codeLines = code.split("\n")
  const codeMinLineIndent = getMinIndent(codeLines)

  return ([output]: readonly string[]) => {
    const outputLines = output.split("\n")
    const minLineIndent = Math.min(getMinIndent(outputLines), codeMinLineIndent)

    return {
      code: codeLines.map((line) => line.slice(minLineIndent)).join("\n"),
      output: outputLines.map((line) => line.slice(minLineIndent)).join("\n"),
    }
  }
}

/**
 * Get number of minimum indent
 */
function getMinIndent(lines: string[]) {
  const lineIndents = lines
    .filter((line) => line.trim())
    .map((line) => / */u.exec(line)![0].length)
  return Math.min(...lineIndents)
}

/**
 * Load test cases
 */
export function loadTestCases(
  ruleName: string,
  _options?: any,
  additionals?: {
    valid?: (RuleTester.ValidTestCase | string)[]
    invalid?: RuleTester.InvalidTestCase[]
  },
): {
  valid: RuleTester.ValidTestCase[]
  invalid: RuleTester.InvalidTestCase[]
} {
  const validFixtureRoot = path.resolve(
    __dirname,
    `../fixtures/rules/${ruleName}/valid/`,
  )
  const invalidFixtureRoot = path.resolve(
    __dirname,
    `../fixtures/rules/${ruleName}/invalid/`,
  )

  const valid = listupInput(validFixtureRoot).map((inputFile) =>
    getConfig(ruleName, inputFile),
  )

  const fixable = plugin.rules[ruleName].meta.fixable != null

  const invalid = listupInput(invalidFixtureRoot).map((inputFile) => {
    const config = getConfig(ruleName, inputFile)
    const errorFile = inputFile.replace(/input\.svelte$/u, "errors.json")
    const outputFile = inputFile.replace(/input\.svelte$/u, "output.svelte")
    let errors
    try {
      errors = fs.readFileSync(errorFile, "utf8")
    } catch (e) {
      writeFixtures(ruleName, inputFile)
      errors = fs.readFileSync(errorFile, "utf8")
    }
    config.errors = JSON.parse(errors)
    if (fixable) {
      let output
      try {
        output = fs.readFileSync(outputFile, "utf8")
      } catch (e) {
        writeFixtures(ruleName, inputFile)
        output = fs.readFileSync(outputFile, "utf8")
      }
      config.output = output
    }

    return config
  })

  if (additionals) {
    if (additionals.valid) {
      valid.push(...additionals.valid)
    }
    if (additionals.invalid) {
      invalid.push(...additionals.invalid)
    }
  }
  for (const test of valid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`)
    }
  }
  for (const test of invalid) {
    if (!test.code) {
      throw new Error(`Empty code: ${test.filename}`)
    }
  }
  return {
    valid,
    invalid,
  }
}

function listupInput(rootDir: string) {
  return [...itrListupInput(rootDir)]
}

function* itrListupInput(rootDir: string): IterableIterator<string> {
  for (const filename of fs.readdirSync(rootDir)) {
    if (filename.startsWith("_")) {
      // ignore
      continue
    }
    const abs = path.join(rootDir, filename)
    if (filename.endsWith("input.svelte")) {
      yield abs
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs)
    }
  }
}

function exists(f: string) {
  try {
    fs.statSync(f)
    return true
  } catch (error) {
    if (error.code === "ENOENT") {
      return false
    }
    throw error
  }
}

function writeFixtures(
  ruleName: string,
  inputFile: string,
  { force }: { force?: boolean } = {},
) {
  const linter = getLinter(ruleName)
  const errorFile = inputFile.replace(/input\.svelte$/u, "errors.json")
  const outputFile = inputFile.replace(/input\.svelte$/u, "output.svelte")

  const config = getConfig(ruleName, inputFile)

  const result = linter.verify(
    config.code,
    {
      rules: {
        [ruleName]: ["error", ...(config.options || [])],
      },
      parser: "svelte-eslint-parser",
    },
    config.filename,
  )
  if (force || !exists(errorFile)) {
    fs.writeFileSync(
      errorFile,
      `${JSON.stringify(
        result.map((m) => ({
          message: m.message,
          line: m.line,
          column: m.column,
        })),
        null,
        4,
      )}\n`,
      "utf8",
    )
  }

  if (force || !exists(outputFile)) {
    const output = SourceCodeFixer.applyFixes(config.code, result).output

    if (plugin.rules[ruleName].meta.fixable != null) {
      fs.writeFileSync(outputFile, output, "utf8")
    }
  }
}

function getLinter(ruleName: string) {
  const linter = new Linter()
  // @ts-expect-error for test
  linter.defineParser("svelte-eslint-parser", svelteESLintParser)
  linter.defineRule(ruleName, plugin.rules[ruleName] as any)

  return linter
}

function getConfig(ruleName: string, inputFile: string) {
  const filename = inputFile.slice(inputFile.indexOf(ruleName))
  const code0 = fs.readFileSync(inputFile, "utf8")
  let code, config
  let configFile: string = inputFile.replace(/input\.svelte$/u, "config.json")
  if (!exists(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json")
  }
  if (exists(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"))
  }
  if (config && typeof config === "object") {
    code = code0
    return Object.assign(
      { parser: require.resolve("svelte-eslint-parser") },
      config,
      { code, filename },
    )
  }
  // inline config
  const configStr = /^<!--(.*?)-->/u.exec(code0)
  if (!configStr) {
    fs.writeFileSync(inputFile, `<!--{}-->\n${code0}`, "utf8")
    throw new Error("missing config")
  } else {
    code = code0.replace(/^(<!--\s*{).*?(}\s*-->)/u, `$1${filename}$2`)
    try {
      config = configStr ? JSON.parse(configStr[1]) : {}
    } catch (e) {
      throw new Error(`${e.message} in @ ${inputFile}`)
    }
  }

  return Object.assign(
    { parser: require.resolve("svelte-eslint-parser") },
    config,
    { code, filename },
  )
}
