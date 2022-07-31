import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"

export default createRule("prefer-reactive-destructuring", {
  meta: {
    docs: {
      description: "Prefer destructuring from objects in reactive statements",
      category: "Best Practices",
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      useDestructuring: `Prefer destructuring in reactive statements`,
      suggestDestructuring: `Use destructuring to get finer-grained redraws`,
    },
    type: "suggestion",
  },
  create(context) {
    return {
      // Finds: $: info = foo.info
      // Suggests:  $: ({ info } = foo);
      [`SvelteReactiveStatement > ExpressionStatement > AssignmentExpression[left.type="Identifier"][right.type="MemberExpression"]`](
        node: TSESTree.AssignmentExpression,
      ) {
        const left = node.left as TSESTree.Identifier
        const right = node.right as TSESTree.MemberExpression

        const prop = (right.property as TSESTree.Identifier).name

        const source = context.getSourceCode()
        const lTokens = source.getTokens(left)
        const rTokens = source.getTokens(right)
        const matched = prop === left.name

        return context.report({
          node,
          loc: node.loc,
          messageId: "useDestructuring",
          suggest: [
            {
              messageId: "suggestDestructuring",
              fix: (fixer) => [
                fixer.insertTextBefore(
                  lTokens[0],
                  matched ? `({ ` : `({ ${prop}: `,
                ),
                fixer.insertTextAfter(lTokens[0], ` }`),
                fixer.replaceTextRange(
                  [
                    rTokens[rTokens.length - 2].range[0],
                    rTokens[rTokens.length - 1].range[1],
                  ],
                  "",
                ),
                fixer.insertTextAfter(rTokens[rTokens.length - 1], ")"),
              ],
            },
          ],
        })
      },
    }
  },
})
