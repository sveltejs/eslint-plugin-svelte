import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"

export default createRule("require-each-key", {
  meta: {
    docs: {
      description: "require keyed `{#each}` block",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: { expectedKey: "Each block should have a key" },
    type: "suggestion",
  },
  create(context) {
    return {
      SvelteEachBlock(node: AST.SvelteEachBlock) {
        if (node.key == null) {
          context.report({
            node,
            messageId: "expectedKey",
          })
        }
      },
    }
  },
})
