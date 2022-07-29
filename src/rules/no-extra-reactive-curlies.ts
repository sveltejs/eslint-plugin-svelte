import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"

export default createRule("no-extra-reactive-curlies", {
  meta: {
    docs: {
      description:
        "disallow wrapping single reactive statements in curly braces",
      category: "Stylistic Issues",
      recommended: false,
      conflictWithPrettier: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      extraCurlies: `Do not wrap reactive statements in curly braces unless necessary.`,
    },
    type: "suggestion",
  },
  create(context) {
    return {
      [`SvelteReactiveStatement > BlockStatement[body.length=1]`]: (
        node: TSESTree.BlockStatement,
      ) => {
        // $: { foo = "bar"; }
        // Only want to transform if the contents of the block is a single assignment
        // Anything else gets us into potentially weird territory and probably isn't worth handling
        if (
          node.body[0].type !== "ExpressionStatement" ||
          node.body[0].expression.type !== "AssignmentExpression"
        ) {
          return false
        }

        const source = context.getSourceCode()

        return context.report({
          node,
          loc: node.loc,
          messageId: "extraCurlies",

          fix(fixer) {
            const tokens = source.getTokens(node, { includeComments: true })

            // Remove everything up to the second token, and the entire last token since
            // those are known to be "{" and "}"
            return [
              fixer.removeRange([tokens[0].range[0], tokens[1].range[0]]),

              fixer.removeRange([
                tokens[tokens.length - 2].range[1],
                tokens[tokens.length - 1].range[1],
              ]),
            ]
          },
        })
      },
    }
  },
})
