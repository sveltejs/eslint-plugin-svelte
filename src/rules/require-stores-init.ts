import { createRule } from "../utils"
import type * as ESTree from "estree"
import { ReferenceTracker } from "eslint-utils"

export default createRule("require-stores-init", {
  meta: {
    docs: {
      description: "require initial value in store",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      storeDefaultValue: `Always set a default value for svelte stores.`,
    },
    type: "suggestion",
  },
  create(context) {
    /** Extract 'svelte/store' references */
    function* extractStoreReferences() {
      const referenceTracker = new ReferenceTracker(context.getScope())
      for (const { node, path } of referenceTracker.iterateEsmReferences({
        "svelte/store": {
          [ReferenceTracker.ESM]: true,
          writable: {
            [ReferenceTracker.CALL]: true,
          },
          readable: {
            [ReferenceTracker.CALL]: true,
          },
          derived: {
            [ReferenceTracker.CALL]: true,
          },
        },
      })) {
        yield {
          node: node as ESTree.CallExpression,
          name: path[path.length - 1],
        }
      }
    }

    return {
      Program() {
        for (const { node, name } of extractStoreReferences()) {
          const minArgs =
            name === "writable" || name === "readable"
              ? 1
              : name === "derived"
              ? 3
              : 0

          if (
            node.arguments.length >= minArgs ||
            node.arguments.some((arg) => arg.type === "SpreadElement")
          ) {
            continue
          }
          context.report({
            node,
            messageId: "storeDefaultValue",
          })
        }
      },
    }
  },
})
