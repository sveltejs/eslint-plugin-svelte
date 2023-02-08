import { createRule } from "../utils"
import { findAttribute, getLangValue } from "../utils/ast-utils"

export default createRule("experimental-require-strict-events", {
  meta: {
    docs: {
      description: "require the strictEvents attribute on <script> tags",
      category: "Experimental",
      recommended: false,
    },
    schema: [],
    messages: {
      missingStrictEvents: `The component must have the strictEvents attribute on its <script> tag or it must define the $$Events interface.`,
    },
    type: "suggestion",
  },
  create(context) {
    let isTs = false
    let hasAttribute = false
    let hasInterface = false
    return {
      SvelteScriptElement(node) {
        const lang = getLangValue(node)?.toLowerCase()
        isTs = lang === "ts" || lang === "typescript"
        hasAttribute = findAttribute(node, "strictEvents") !== null
      },
      TSInterfaceDeclaration(node) {
        if (node.id.name === "$$Events") {
          hasInterface = true
        }
      },
      "Program:exit"() {
        if (isTs && !hasAttribute && !hasInterface) {
          context.report({
            loc: {
              line: 1,
              column: 1,
            },
            messageId: "missingStrictEvents",
          })
        }
      },
    }
  },
})
