/* eslint node/no-unsupported-features/es-syntax: off -- not node */
import * as coreRules from "../../../../node_modules/eslint4b/dist/core-rules"
// eslint-disable-next-line node/no-missing-import -- no build
import plugin from "../../../../"

const CATEGORY_TITLES = {
  "Possible Errors": "Svelte Rules(Possible Errors)",
  "Security Vulnerability": "Svelte Rules(Security Vulnerability)",
  "Best Practices": "Svelte Rules(Best Practices)",
  "Stylistic Issues": "Svelte Rules(Stylistic Issues)",
  System: "Svelte Rules(System)",
  "Extension Rules": "Svelte Rules(Extension Rules)",
  "eslint-core-rules@Possible Errors": "ESLint core rules(Possible Errors)",
  "eslint-core-rules@Best Practices": "ESLint core rules(Best Practices)",
  "eslint-core-rules@Strict Mode": "ESLint core rules(Strict Mode)",
  "eslint-core-rules@Variables": "ESLint core rules(Variables)",
  "eslint-core-rules@Node.js and CommonJS":
    "ESLint core rules(Node.js and CommonJS)",
  "eslint-core-rules@Stylistic Issues": "ESLint core rules(Stylistic Issues)",
  "eslint-core-rules@ECMAScript 6": "ESLint core rules(ECMAScript 6)",
}
const CATEGORY_INDEX = {
  "Possible Errors": 1,
  "Security Vulnerability": 2,
  "Best Practices": 3,
  "Stylistic Issues": 4,
  System: 5,
  "Extension Rules": 5.5,
  "eslint-core-rules@Possible Errors": 6,
  "eslint-core-rules@Best Practices": 7,
  "eslint-core-rules@Strict Mode": 8,
  "eslint-core-rules@Variables": 9,
  "eslint-core-rules@Node.js and CommonJS": 10,
  "eslint-core-rules@Stylistic Issues": 11,
  "eslint-core-rules@ECMAScript 6": 12,
}
const CATEGORY_CLASSES = {
  "Possible Errors": "eslint-plugin-svelte__category",
  "Security Vulnerability": "eslint-plugin-svelte__category",
  "Best Practices": "eslint-plugin-svelte__category",
  "Stylistic Issues": "eslint-plugin-svelte__category",
  System: "eslint-plugin-svelte__category",
  "Extension Rules": "eslint-plugin-svelte__category",
}

const allRules = []

for (const k of Object.keys(plugin.rules)) {
  const rule = plugin.rules[k]
  if (rule.meta.deprecated) {
    continue
  }

  const category = rule.meta.docs.extensionRule
    ? "Extension Rules"
    : rule.meta.docs.category

  allRules.push({
    classes: "eslint-plugin-svelte__rule",
    category,
    ruleId: rule.meta.docs.ruleId,
    url: rule.meta.docs.url,
    initChecked: true,
  })
}
for (const k of Object.keys(coreRules)) {
  const rule = coreRules[k]
  allRules.push({
    category: `eslint-core-rules@${rule.meta.docs.category}`,
    fallbackTitle: `ESLint core rules(${rule.meta.docs.category})`,
    ruleId: k,
    url: rule.meta.docs.url,
    initChecked: rule.meta.docs.recommended,
  })
}

allRules.sort((a, b) =>
  a.ruleId > b.ruleId ? 1 : a.ruleId < b.ruleId ? -1 : 0,
)

export const categories = []

for (const rule of allRules) {
  const title = CATEGORY_TITLES[rule.category] || rule.fallbackTitle
  let category = categories.find((c) => c.title === title)
  if (!category) {
    category = {
      classes: CATEGORY_CLASSES[rule.category],
      category: rule.category,
      categoryOrder: CATEGORY_INDEX[rule.category],
      title,
      rules: [],
    }
    categories.push(category)
  }
  category.rules.push(rule)
}
categories.sort((a, b) =>
  a.categoryOrder > b.categoryOrder
    ? 1
    : a.categoryOrder < b.categoryOrder
    ? -1
    : a.title > b.title
    ? 1
    : a.title < b.title
    ? -1
    : 0,
)

export const DEFAULT_RULES_CONFIG = allRules.reduce((c, r) => {
  if ([].includes(r.ruleId)) {
    c[r.ruleId] = "error"
  } else {
    c[r.ruleId] = r.initChecked ? "error" : "off"
  }
  return c
}, {})

export const rules = allRules
