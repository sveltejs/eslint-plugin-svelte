import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-unnecessary-reactive-curlies", {
  meta: {
    docs: {
      description:
        "disallow wrapping single reactive statements in curly braces",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unnecessaryCurlies: `Do not wrap reactive statements in curly braces unless necessary.`,
    },
    type: "suggestion",
  },
  create(context) {
    return {
      [`SvelteReactiveStatement > BlockStatement[body.length=1]`]: (
        node: AST.SvelteReactiveStatement,
      ) => {
        const source = context.getSourceCode()

        return context.report({
          node,
          loc: node.loc,
          messageId: "unnecessaryCurlies",

          fix(fixer) {
            const tokens = source.getTokens(node)

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
