import { rules as pluginRules } from '../../../../../src/utils/rules.ts'
import { Linter } from 'eslint'
import * as svelteEslintParser from 'svelte-eslint-parser'

export { preprocess, postprocess } from '../../../../../src/processor/index.ts'

const linter = new Linter()

export const categories = [
  {
    title: 'Possible Errors',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'Security Vulnerability',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'Best Practices',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'Stylistic Issues',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'Extension Rules',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'Experimental',
    classes: 'svelte-category',
    rules: [],
  },
  {
    title: 'System',
    classes: 'svelte-category',
    rules: [],
  },
  {
    type: 'problem',
    title: 'Possible Errors (CORE)',
    classes: 'core-category',
    rules: [],
  },
  {
    type: 'suggestion',
    title: 'Suggestions (CORE)',
    classes: 'core-category',
    rules: [],
  },
  {
    type: 'layout',
    title: 'Layout & Formatting (CORE)',
    classes: 'core-category',
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
    classes: 'svelte-rule',
    url: rule.meta.docs.url,
  }
  rules.push(data)
  const category = rule.meta.docs.category
  categories.find((c) => c.title === category).rules.push(data)

  if (
    rule.meta.docs.ruleId !==
      'svelte/no-export-load-in-svelte-module-in-kit-pages' &&
    rule.meta.docs.ruleId !== 'svelte/valid-prop-names-in-kit-pages'
  ) {
    DEFAULT_RULES_CONFIG[rule.meta.docs.ruleId] = 'error'
  }
}

for (const [ruleId, rule] of linter.getRules()) {
  if (rule.meta.deprecated) {
    continue
  }
  const data = {
    ruleId,
    rule,
    classes: 'core-rule',
    url: rule.meta.docs.url,
  }
  rules.push(data)
  const type = rule.meta.type
  categories.find((c) => c.type === type).rules.push(data)

  if (rule.meta.docs.recommended && ruleId !== 'no-inner-declarations') {
    DEFAULT_RULES_CONFIG[ruleId] = 'error'
  }
}

/** Get rule data */
export function getRule(ruleId) {
  for (const cat of categories) {
    for (const rule of cat.rules) {
      if (rule.ruleId === ruleId) {
        return rule
      }
    }
  }
  return ''
}

export function createLinter() {
  const linter = new Linter()
  linter.defineParser('svelte-eslint-parser', svelteEslintParser)
  for (const rule of pluginRules) {
    linter.defineRule(rule.meta.docs.ruleId, rule)
  }

  return linter
}
