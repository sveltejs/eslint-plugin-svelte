import { createRule } from "../utils"
import rule from "./require-optimized-style-attribute"

export default createRule("no-non-optimized-style-attributes", {
  meta: {
    docs: {
      ...rule.meta.docs,
      recommended: false,
    },
    schema: rule.meta.schema,
    messages: rule.meta.messages,
    type: rule.meta.type,
    deprecated: true,
    replacedBy: ["require-optimized-style-attribute"],
  },
  create: rule.create,
})
