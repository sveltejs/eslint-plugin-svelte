import { createRule } from "../utils"
import { findAttribute, getLangValue } from "../utils/ast-utils"

export default createRule("require-strict-events", {
  meta: {
    docs: {
      description: "require the strictEvents attribute on <script> tags",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      missingStrictEvents: `The <script> tag is missing the strictEvents attribute.`,
    },
    type: "suggestion",
  },
  create(context) {
    return {
      SvelteScriptElement(node) {
        const lang = getLangValue(node)?.toLowerCase()
        if (
          (lang === "ts" || lang === "typescript") &&
          findAttribute(node, "context") === null &&
          findAttribute(node, "strictEvents") === null
        ) {
          context.report({ node, messageId: "missingStrictEvents" })
        }
      },
    }
  },
})
