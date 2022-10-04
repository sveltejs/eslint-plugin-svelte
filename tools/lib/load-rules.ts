import path from "path"
import fs from "fs"

/**
 * Get the all rules
 * @returns {Array} The all rules
 */
function readRules() {
  const rulesLibRoot = path.resolve(__dirname, "../../src/rules")
  const rules = []
  for (const name of iterateTsFiles()) {
    const ruleName = name.replace(/\.ts$/u, "")
    const ruleId = `svelte/${ruleName}`
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports -- ignore
    const module = require(path.join(rulesLibRoot, name))
    const rule = module && module.default
    if (!rule || typeof rule.create !== "function") {
      continue
    }

    rule.meta.docs.ruleName = ruleName
    rule.meta.docs.ruleId = ruleId

    rules.push(rule)
  }
  return rules
}

export const rules = readRules()

/** Iterate ts files */
function* iterateTsFiles() {
  const rulesLibRoot = path.resolve(__dirname, "../../src/rules")
  const files = fs.readdirSync(rulesLibRoot)

  while (files.length) {
    const file = files.shift()!
    if (file.endsWith(".ts")) {
      yield file
      continue
    }
    const filePath = path.join(rulesLibRoot, file)
    if (!fs.statSync(filePath).isDirectory()) {
      continue
    }
    files.unshift(...fs.readdirSync(filePath).map((n) => path.join(file, n)))
  }
}
