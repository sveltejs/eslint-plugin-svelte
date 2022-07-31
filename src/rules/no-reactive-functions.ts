import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"

export default createRule("no-reactive-functions", {
  meta: {
    docs: {
      description: "",
      category: "Best Practices",
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noReactiveFns: `Do not create functions inside reactive statements unless absolutely necessary.`,
      fixReactiveFns: `Move the function out of the reactive statement`,
    },
    type: "suggestion", // "problem", or "layout",
  },
  create(context) {
    return {
      // $: foo = () => { ... }
      [`SvelteReactiveStatement > ExpressionStatement > AssignmentExpression > :function`](
        node: TSESTree.ArrowFunctionExpression,
      ) {
        // Move upwards to include the entire label
        const parent = node.parent?.parent?.parent

        if (!parent) {
          return false
        }

        const source = context.getSourceCode()

        return context.report({
          node: parent,
          loc: parent.loc,
          messageId: "noReactiveFns",
          suggest: [
            {
              messageId: "fixReactiveFns",
              fix(fixer) {
                const tokens = source.getTokens(parent)

                // Replace the entire reactive label with "const"
                return fixer.replaceTextRange(
                  [tokens[0].range[0], tokens[1].range[1]],
                  "const",
                )
              },
            },
          ],
        })
      },
    }
  },
})
