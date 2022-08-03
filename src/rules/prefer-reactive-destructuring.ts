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
        const lToken = source.getFirstToken(left)
        const rTokens = source.getLastTokens(right, {
          includeComments: true,
          count: 2,
        })
        const matched = prop === left.name

        return context.report({
          node,
          loc: node.loc,
          messageId: "useDestructuring",
          suggest:
            // Don't show suggestions for entries like $: info = foo.bar.info, the destructuring
            // just looks too gross and complicates the rule too much
            right.object.type === "MemberExpression"
              ? []
              : [
                  {
                    messageId: "suggestDestructuring",
                    fix: (fixer) => [
                      fixer.insertTextBefore(
                        lToken,
                        matched ? `({ ` : `({ ${prop}: `,
                      ),
                      fixer.insertTextAfter(lToken, ` }`),
                      fixer.replaceTextRange(
                        [rTokens[0].range[0], rTokens[1].range[1]],
                        ")",
                      ),
                    ],
                  },
                ],
        })
      },
    }
  },
})
