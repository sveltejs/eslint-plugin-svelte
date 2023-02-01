import { createRule } from "../utils"

export default createRule("require-event-dispatcher-types", {
  meta: {
    docs: {
      description: "require typed event dispatcher",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      storeDefaultValue: `Always add type arguments when calling the createEventDispatcher function.`,
    },
    type: "suggestion",
  },
  create() {
    return {
      Program() {
      },
    }
  },
})
