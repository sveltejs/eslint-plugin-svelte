import { createRule } from "../utils"
import { getLangValue } from "../utils/ast-utils"
import { extractCreateEventDispatcherReferences } from "./reference-helpers/svelte-createEventDispatcher"

export default createRule("require-event-dispatcher-types", {
  meta: {
    docs: {
      description: "require type parameters for createEventDispatcher",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      missingTypeParameter: `Type parameters missing for the createEventDispatcher function call.`,
    },
    type: "suggestion",
  },
  create(context) {
    let isTs = false
    return {
      SvelteScriptElement(node) {
        const lang = getLangValue(node)?.toLowerCase()
        if (lang === "ts" || lang === "typescript") {
          isTs = true
        }
      },
      "Program:exit"() {
        if (!isTs) {
          return
        }
        for (const node of extractCreateEventDispatcherReferences(context)) {
          if (node.typeParameters === undefined) {
            context.report({ node, messageId: "missingTypeParameter" })
          }
        }
      },
    }
  },
})
