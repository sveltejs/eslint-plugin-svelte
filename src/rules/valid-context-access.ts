import { createRule } from "../utils"
import { extractContextReferences } from "./reference-helpers/svelte-context"
import { extractSvelteLifeCycleReferences } from "./reference-helpers/svelte-lifecycle"
import type { AST } from "svelte-eslint-parser"
import type { TSESTree } from "@typescript-eslint/types"

export default createRule("valid-context-access", {
  meta: {
    docs: {
      description:
        "context functions must be called during component initialization.",
      category: "Possible Errors",
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
    // // This rule doesn't check other than Svelte files.
    if (!context.parserServices.isSvelte) {
      return {}
    }

    const sourceCode = context.getSourceCode()
    const lifeCycleReferences = Array.from(
      extractSvelteLifeCycleReferences(context),
    ).map((r) => r.node)

    // Extract <script> blocks that is not module=context.
    const scriptNotModuleElements: AST.SvelteScriptElement[] =
      sourceCode.ast.body.filter((b) => {
        if (b.type !== "SvelteScriptElement") return false
        const isModule = b.startTag.attributes.some((a) => {
          return (
            a.type === "SvelteAttribute" &&
            a.key.name === "context" &&
            a.value.some(
              (v) => v.type === "SvelteLiteral" && v.value === "module",
            )
          )
        })
        return !isModule
      }) as AST.SvelteScriptElement[]

    const scopeManager = sourceCode.scopeManager
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

    /** Return true if tnodeA is inside of nodeB. */
    function isInsideOfNodeB(
      nodeA: TSESTree.Node | AST.SvelteScriptElement,
      nodeB: TSESTree.Node,
    ) {
      return (
        nodeA.range[0] <= nodeB.range[0] && nodeB.range[1] <= nodeA.range[1]
      )
    }

    /** Return true if the node is there inside of <script> block that is not module=context. */
    function isInsideOfSvelteScriptElement(node: TSESTree.Node) {
      for (const script of scriptNotModuleElements) {
        if (isInsideOfNodeB(script, node)) {
          return true
        }
      }
      return false
    }

    const awaitExpressions: {
      belongingFunction:
        | TSESTree.FunctionDeclaration
        | TSESTree.VariableDeclaration
      node: TSESTree.Node
    }[] = []

    /** Return true if the given node is later than the await expression. */
    function isAfterAwait(node: TSESTree.CallExpression) {
      for (const awaitExpression of awaitExpressions) {
        const { belongingFunction, node: awaitNode } = awaitExpression
        if (isInsideOfNodeB(node, belongingFunction)) {
          continue
        }
        return awaitNode.range[0] <= node.range[0]
      }
      return false
    }

    /** Let's lint! */
    function doLint(
      visitedCallExpressions: TSESTree.CallExpression[],
      contextCallExpression: TSESTree.CallExpression,
      currentNode: TSESTree.CallExpression,
    ) {
      // Report if context function is called outside of <script> block.
      if (!isInsideOfSvelteScriptElement(currentNode)) {
        report(contextCallExpression)
        return
      }

      if (isAfterAwait(currentNode)) {
        report(contextCallExpression)
        return
      }

      let { parent } = currentNode
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
          } else if (lifeCycleReferences.includes(parent.expression)) {
            report(contextCallExpression)
          }
        }
      }
    }

    return {
      "Program:exit"() {
        for (const { node } of extractContextReferences(context)) {
          const visitedCallExpressions: TSESTree.CallExpression[] = []
          doLint(visitedCallExpressions, node, node)
        }
      },
      AwaitExpression(node) {
        let parent: TSESTree.Node | undefined = node.parent
        while (parent) {
          if (parent.type === "FunctionDeclaration") {
            awaitExpressions.push({ belongingFunction: parent, node })
          } else if (parent.type === "VariableDeclaration") {
            awaitExpressions.push({ belongingFunction: parent, node })
          }
          parent = parent.parent
        }
      },
    }
  },
})
