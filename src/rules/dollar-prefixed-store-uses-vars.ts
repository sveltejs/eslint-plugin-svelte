import type * as ESTree from "estree"
import { createRule } from "../utils"
import { findVariable } from "../utils/ast-utils"

export default createRule("dollar-prefixed-store-uses-vars", {
  meta: {
    docs: {
      description: "prevent $-prefixed variables to be marked as unused",
      category: "System",
      recommended: "base",
    },
    schema: [],
    messages: {},
    type: "problem",
    deprecated: true, // This rule is not needed when using svelte-eslint-parser@v0.14.0 or later.
  },
  create(context) {
    if (!context.parserServices.isSvelte) {
      return {}
    }

    /** Process identifier */
    function processId(node: ESTree.Identifier) {
      const variable = findVariable(context, node)
      if (!variable) {
        return
      }
      for (const reference of variable.references) {
        if (
          reference.identifier.name.startsWith("$") &&
          reference.identifier.name.slice(1) === node.name
        ) {
          context.markVariableAsUsed(node.name)
          break
        }
      }
    }

    return {
      "ImportDefaultSpecifier > Identifier": processId,
      "ImportSpecifier > Identifier.local": processId,
      "ImportNamespaceSpecifier > Identifier": processId,
    }
  },
})
