import { createRule } from "../utils"
import { extractContextReferences } from "./reference-helpers/svelte-context"
import type { TSESTree } from "@typescript-eslint/types"

export default createRule("valid-context-access", {
  meta: {
    docs: {
      description:
        "context functions must be called during component initialization.",
      category: "Possible Errors",
      // TODO Switch to recommended in the major version.
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected:
        "Do not call {{function}} except during component initialization.",
    },
    type: "problem",
  },
  create(context) {
    const scopeManager = context.getSourceCode().scopeManager
    const toplevelScope =
      scopeManager.globalScope?.childScopes.find(
        (scope) => scope.type === "module",
      ) || scopeManager.globalScope

    /** report ESLint error */
    function report(node: TSESTree.CallExpression) {
      context.report({
        loc: node.loc,
        messageId: "unexpected",
        data: {
          function:
            node.callee.type === "Identifier"
              ? node.callee.name
              : "context function",
        },
      })
    }

    /** Get nodes where the variable is used */
    function getReferences(id: TSESTree.Identifier | TSESTree.BindingName) {
      const variable = toplevelScope?.variables.find((v) => {
        if (id.type === "Identifier") {
          return v.identifiers.includes(id)
        }
        return false
      })
      if (variable) {
        return variable.references.filter((r) => r.identifier !== id)
      }
      return []
    }

    /** Let's lint! */
    function doLint(
      visitedCallExpressions: TSESTree.CallExpression[],
      contextCallExpression: TSESTree.CallExpression,
      currentNode: TSESTree.CallExpression,
    ) {
      let { parent } = currentNode
      if (parent?.type !== "ExpressionStatement") {
        report(contextCallExpression)
        return
      }
      while (parent) {
        parent = parent.parent
        if (
          parent?.type === "VariableDeclaration" ||
          parent?.type === "FunctionDeclaration"
        ) {
          const references =
            parent.type === "VariableDeclaration"
              ? getReferences(parent.declarations[0].id)
              : parent.id
              ? getReferences(parent.id)
              : []

          for (const reference of references) {
            if (reference.identifier?.parent?.type === "CallExpression") {
              if (
                !visitedCallExpressions.includes(reference.identifier.parent)
              ) {
                visitedCallExpressions.push(reference.identifier.parent)
                doLint(
                  visitedCallExpressions,
                  contextCallExpression,
                  reference.identifier?.parent,
                )
              }
            }
          }
        } else if (parent?.type === "ExpressionStatement") {
          if (parent.expression.type !== "CallExpression") {
            report(contextCallExpression)
          } else if (parent.expression.callee.type === "Identifier") {
            report(contextCallExpression)
          }
        }
      }
    }

    return {
      Program() {
        for (const { node } of extractContextReferences(context)) {
          const visitedCallExpressions: TSESTree.CallExpression[] = []
          doLint(visitedCallExpressions, node, node)
        }
      },
    }
  },
})
