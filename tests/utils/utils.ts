import fs from "fs"
import path from "path"
import type { RuleTester } from "eslint"
import { Linter } from "eslint"
import * as svelteESLintParser from "svelte-eslint-parser"
// eslint-disable-next-line @typescript-eslint/no-require-imports -- tests
import plugin = require("../../src/index")
import { applyFixes } from "./source-code-fixer"
import { parse as parseYaml, stringify as stringifyYaml } from "yaml"

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

export const FIXTURES_ROOT = path.resolve(__dirname, `../fixtures/`)
export const RULES_PROJECT = path.resolve(
  FIXTURES_ROOT,
  "./rules/tsconfig.json",
)

/**
 * Get the rule fixtures root directory
 */
export function getRuleFixturesRoot(ruleName: string): string {
  return path.resolve(FIXTURES_ROOT, `./rules/${ruleName}`)
}

/**
 * Load test cases
 */
export function loadTestCases(
  ruleName: string,
  options?: {
    additionals?: {
      valid?: (RuleTester.ValidTestCase | string)[]
      invalid?: RuleTester.InvalidTestCase[]
    }
    filter?: (file: string) => boolean
  },
): {
  valid: RuleTester.ValidTestCase[]
  invalid: RuleTester.InvalidTestCase[]
} {
  const rootDir = getRuleFixturesRoot(ruleName)
  const validFixtureRoot = path.resolve(rootDir, `./valid/`)
  const invalidFixtureRoot = path.resolve(rootDir, `./invalid/`)

  const filter = options?.filter ?? (() => true)

  const valid = listupInput(validFixtureRoot)
    .filter(filter)
    .map((inputFile) => getConfig(ruleName, inputFile))

  const fixable = plugin.rules[ruleName].meta.fixable != null

  const invalid = listupInput(invalidFixtureRoot)
    .filter(filter)
    .map((inputFile) => {
      const config = getConfig(ruleName, inputFile)
      const errorFile = inputFile.replace(/input\.[a-z]+$/u, "errors.yaml")
      const outputFile = inputFile.replace(/input\.[a-z]+$/u, "output.svelte")
      let errors
      if (fs.existsSync(errorFile)) {
        errors = fs.readFileSync(errorFile, "utf8")
      } else if (
        fs.existsSync(inputFile.replace(/input\.[a-z]+$/u, "errors.json"))
      ) {
        // Workaround to not block PRs.
        errors = fs.readFileSync(
          inputFile.replace(/input\.[a-z]+$/u, "errors.json"),
          "utf8",
        )
      } else {
        writeFixtures(ruleName, inputFile)
        errors = fs.readFileSync(errorFile, "utf8")
      }
      config.errors = parseYaml(errors)
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

  if (options?.additionals) {
    if (options.additionals.valid) {
      valid.push(...options.additionals.valid)
    }
    if (options.additionals.invalid) {
      invalid.push(...options.additionals.invalid)
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
    if (path.basename(filename, path.extname(filename)).endsWith("input")) {
      yield abs
    } else if (fs.statSync(abs).isDirectory()) {
      yield* itrListupInput(abs)
    }
  }
}

// Necessary because of this:
// https://github.com/eslint/eslint/issues/14936#issuecomment-906746754
function applySuggestion(code: string, suggestion: Linter.LintSuggestion) {
  const { fix } = suggestion

  return `${code.slice(0, fix.range[0])}${fix.text}${code.slice(fix.range[1])}`
}

function writeFixtures(
  ruleName: string,
  inputFile: string,
  { force }: { force?: boolean } = {},
) {
  const linter = getLinter(ruleName)
  const errorFile = inputFile.replace(/input\.[a-z]+$/u, "errors.yaml")
  const outputFile = inputFile.replace(/input\.[a-z]+$/u, "output.svelte")

  const config = getConfig(ruleName, inputFile)

  const parser =
    path.extname(inputFile) === ".svelte" ? "svelte-eslint-parser" : undefined
  const result = linter.verify(
    config.code,
    {
      rules: {
        [ruleName]: ["error", ...(config.options || [])],
      },
      parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: {
          ts: "@typescript-eslint/parser",
          js: "espree",
        },
        ...config.parserOptions,
      },
    },
    config.filename,
  )

  if (force || !fs.existsSync(errorFile)) {
    fs.writeFileSync(
      errorFile,
      `${stringifyYaml(
        result.map((m) => ({
          message: m.message,
          line: m.line,
          column: m.column,
          suggestions: m.suggestions
            ? m.suggestions.map((s) => ({
                desc: s.desc,
                messageId: s.messageId,
                // Need to have this be the *fixed* output, not just the fix content or anything
                output: applySuggestion(config.code, s),
              }))
            : null,
        })),
      )}`,
      "utf8",
    )
  }

  if (force || !fs.existsSync(outputFile)) {
    const output = applyFixes(config.code, result).output

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
  const code = fs.readFileSync(inputFile, "utf8")
  let config
  let configFile: string = inputFile.replace(/input\.[a-z]+$/u, "config.json")
  if (!fs.existsSync(configFile)) {
    configFile = path.join(path.dirname(inputFile), "_config.json")
  }
  if (fs.existsSync(configFile)) {
    config = JSON.parse(fs.readFileSync(configFile, "utf8"))
  }
  const parser =
    path.extname(filename) === ".svelte"
      ? require.resolve("svelte-eslint-parser")
      : undefined

  return Object.assign(
    {
      parser,
      parserOptions: {
        project: RULES_PROJECT,
        parser: {
          ts: "@typescript-eslint/parser",
          js: "espree",
        },
        extraFileExtensions: [".svelte"],
      },
    },
    config,
    { code, filename: inputFile },
  )
}
