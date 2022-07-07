import type { RuleModule } from "./types"
import { rules as ruleList } from "./utils/rules"
import base from "./configs/base"
import recommended from "./configs/recommended"
import prettier from "./configs/prettier"
import * as processor from "./processor"

const configs = {
  base,
  recommended,
  prettier,
}

const rules = ruleList.reduce((obj, r) => {
  obj[r.meta.docs.ruleName] = r
  return obj
}, {} as { [key: string]: RuleModule })

export = {
  configs,
  rules,
  processors: {
    ".svelte": processor,
    svelte: processor,
  },
}
