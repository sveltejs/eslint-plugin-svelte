import { createRule } from "../utils"
import type * as ESTree from "estree"

export default createRule("no-store-async", {
  meta: {
    docs: {
      description:
        "disallow using async/await inside svelte stores because it causes issues with the auto-unsubscribing features",
      category: "Possible Errors",
      recommended: true,
      default: "error",
    },
    schema: [],
    messages: {
      unexpected: "Do not pass async functions to svelte stores.",
    },
    type: "problem",
  },
  create(context) {
    return {
      CallExpression(node: ESTree.CallExpression) {
        if (node.callee.type !== "Identifier") return
        const { name } = node.callee
        if (name !== "writable" && name !== "readable" && name !== "derived")
          return
        const [, fn] = node.arguments
        if (fn.type !== "ArrowFunctionExpression" || !fn.async) return

        const start = fn.loc?.start ?? { line: 1, column: 0 }
        context.report({
          node: fn,
          loc: {
            start,
            end: {
              line: start.line,
              column: start.column + 5,
            },
          },
          messageId: "unexpected",
        })
      },
    }
  },
})
