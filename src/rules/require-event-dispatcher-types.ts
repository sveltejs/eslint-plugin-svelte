import { createRule } from "../utils"
import { extractCreateEventDispatcherReferences } from "./reference-helpers/svelte-createEventDispatcher"

export default createRule("require-event-dispatcher-types", {
  meta: {
    docs: {
      description: "require typed event dispatcher",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      missingTypeParameter: `Always specify type parameters when calling the createEventDispatcher function.`,
    },
    type: "suggestion",
  },
  create(context) {
    return {
      Program() {
        for (const node of extractCreateEventDispatcherReferences(context)) {
          if (node.typeParameters === undefined) {
            context.report({ node, messageId: "missingTypeParameter" })
          }
        }
      },
    }
  },
})
