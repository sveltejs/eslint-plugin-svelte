import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { createStoreChecker } from "./reference-helpers/svelte-store"

export default createRule("require-store-reactive-access", {
  meta: {
    docs: {
      description:
        "disallow to render store itself. Need to use $ prefix or get function.",
      category: "Possible Errors",
      // TODO Switch to recommended in the major version.
      // recommended: true,
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      usingRawStoreInText:
        "Use $ prefix or get function, instead of using raw store in text mustache interpolation.",
    },
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isSvelte) {
      return {}
    }
    const isStore = createStoreChecker(context)

    return {
      SvelteMustacheTag(node) {
        if (!isStringMustache(node)) {
          return
        }
        const { expression } = node
        if (isStore(expression)) {
          context.report({
            node: expression,
            messageId: "usingRawStoreInText",
            fix:
              expression.type === "Identifier"
                ? (fixer) => fixer.insertTextBefore(expression, "$")
                : null,
          })
        }
      },
    }

    /**
     * Checks whether the given mustache node is a string expression or not
     */
    function isStringMustache(node: AST.SvelteMustacheTag) {
      if (node.parent.type !== "SvelteAttribute") {
        // Text interpolation
        return true
      }
      if (node.parent.value.length > 1) {
        // Template attribute value
        return true
      }
      const element = node.parent.parent.parent
      if (element.type !== "SvelteElement") {
        // HTML attribute value
        return true
      }
      if (
        element.kind === "html" ||
        (element.kind === "special" && element.name.name === "svelte:element")
      ) {
        // HTML attribute value
        return true
      }
      // Maybe component props
      return true
    }
  },
})
