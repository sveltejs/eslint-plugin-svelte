// eslint-disable-next-line node/file-extension-in-import -- ignore
import { rules as pluginRules } from "../../../../../src/utils/rules.ts"
import { Linter } from "eslint"
import * as svelteEslintParser from "svelte-eslint-parser"
// eslint-disable-next-line node/file-extension-in-import -- ignore
export { preprocess, postprocess } from "../../../../../src/processor/index.ts"

const linter = new Linter()

export const categories = [
  {
    title: "Possible Errors",
    rules: [],
  },
  {
    title: "Security Vulnerability",
    rules: [],
  },
  {
    title: "Best Practices",
    rules: [],
  },
  {
    title: "Stylistic Issues",
    rules: [],
  },
  {
    title: "Extension Rules",
    rules: [],
  },
  {
    title: "System",
    rules: [],
  },
  {
    type: "problem",
    title: "Possible Errors (CORE)",
    rules: [],
  },
  {
    type: "suggestion",
    title: "Suggestions (CORE)",
    rules: [],
  },
  {
    type: "layout",
    title: "Layout & Formatting (CORE)",
    rules: [],
  },
]
export const DEFAULT_RULES_CONFIG = {}

const rules = []
for (const rule of pluginRules) {
  if (rule.meta.deprecated) {
    continue
  }
  const data = {
    ruleId: rule.meta.docs.ruleId,
    rule,
    url: rule.meta.docs.url,
  }
  rules.push(data)
  const category = rule.meta.docs.category
  categories.find((c) => c.title === category).rules.push(data)

  // if (rule.meta.docs.recommended) {
  DEFAULT_RULES_CONFIG[rule.meta.docs.ruleId] = "error"
  // }
}

for (const [ruleId, rule] of linter.getRules()) {
  if (rule.meta.deprecated) {
    continue
  }
  const data = {
    ruleId,
    rule,
    url: rule.meta.docs.url,
  }
  rules.push(data)
  const type = rule.meta.type
  categories.find((c) => c.type === type).rules.push(data)

  if (rule.meta.docs.recommended) {
    DEFAULT_RULES_CONFIG[ruleId] = "error"
  }
}
/** get url */
export function getURL(ruleId) {
  return linter.getRules().get(ruleId)?.meta.docs.url ?? ""
}

export function createLinter() {
  const linter = new Linter()
  linter.defineParser("svelte-eslint-parser", svelteEslintParser)
  for (const rule of pluginRules) {
    linter.defineRule(rule.meta.docs.ruleId, rule)
  }

  return linter
}
