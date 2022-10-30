// import { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { extractStoreReferences } from "./reference-helpers/svelte-store"

export default createRule("require-store-callbacks-use-set-param", {
  meta: {
    docs: {
      description: "",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected: "Store callbacks must use `set` param.",
    },
    type: "suggestion", // "problem", or "layout",
  },
  create(context) {
    return {
      Program() {
        for (const { node } of extractStoreReferences(context, [
          "readable",
          "writable",
        ])) {
          const [_, fn] = node.arguments
          if (!fn || fn.type !== "ArrowFunctionExpression") {
            continue
          }
          const param = fn.params[0]
          if (!param || (param.type === "Identifier" && param.name !== "set")) {
            context.report({
              node: fn,
              loc: fn.loc!,
              messageId: "unexpected",
            })
          }
        }
      },
    }
  },
})
