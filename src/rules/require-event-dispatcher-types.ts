import { createRule } from "../utils"
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
