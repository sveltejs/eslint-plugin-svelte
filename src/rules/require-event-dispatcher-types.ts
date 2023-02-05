import { ReferenceTracker } from "eslint-utils"
import { createRule } from "../utils"
import { getLangValue } from "../utils/ast-utils"
import type { TSESTree } from "@typescript-eslint/types"

export default createRule("require-event-dispatcher-types", {
  meta: {
    docs: {
      description: "require type parameters for `createEventDispatcher`",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      missingTypeParameter: `Type parameters missing for the \`createEventDispatcher\` function call.`,
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
        const referenceTracker = new ReferenceTracker(context.getScope())
        for (const { node: n } of referenceTracker.iterateEsmReferences({
          svelte: {
            [ReferenceTracker.ESM]: true,
            createEventDispatcher: {
              [ReferenceTracker.CALL]: true,
            },
          },
        })) {
          const node = n as TSESTree.CallExpression
          if (node.typeParameters === undefined) {
            context.report({ node, messageId: "missingTypeParameter" })
          }
        }
      },
    }
  },
})
