import type * as ESTree from "estree"
import { createRule } from "../utils"
import type { RuleContext } from "../types"
import { extractStoreReferences } from "./reference-helpers/svelte-store"

export default createRule("derived-has-same-inputs-outputs", {
  meta: {
    docs: {
      description: "",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected: "The argument name should be '{{name}}'.",
    },
    type: "suggestion",
  },
  create(context) {
    /** check node type */
    function isIdentifierOrArrayExpression(
      node: ESTree.SpreadElement | ESTree.Expression,
    ): node is ESTree.Identifier | ESTree.ArrayExpression {
      return ["Identifier", "ArrayExpression"].includes(node.type)
    }

    type ArrowFunctionExpressionOrFunctionExpression =
      | ESTree.ArrowFunctionExpression
      | ESTree.FunctionExpression

    /** check node type */
    function isFunctionExpression(
      node: ESTree.SpreadElement | ESTree.Expression,
    ): node is ArrowFunctionExpressionOrFunctionExpression {
      return ["ArrowFunctionExpression", "FunctionExpression"].includes(
        node.type,
      )
    }

    /**
     * Check for identifier type.
     * e.g. derived(a, ($a) => {});
     */
    function checkIdentifier(
      context: RuleContext,
      args: ESTree.Identifier,
      fn: ArrowFunctionExpressionOrFunctionExpression,
    ) {
      const fnParam = fn.params[0]
      if (fnParam.type !== "Identifier") return
      const expectedName = `$${args.name}`
      if (expectedName !== fnParam.name) {
        context.report({
          node: fn,
          loc: {
            start: fnParam.loc?.start ?? { line: 1, column: 0 },
            end: fnParam.loc?.end ?? { line: 1, column: 0 },
          },
          messageId: "unexpected",
          data: { name: expectedName },
        })
      }
    }

    /**
     * Check for array type.
     * e.g. derived([ a, b ], ([ $a, $b ]) => {})
     */
    function checkArrayExpression(
      context: RuleContext,
      args: ESTree.ArrayExpression,
      fn: ArrowFunctionExpressionOrFunctionExpression,
    ) {
      const fnParam = fn.params[0]
      if (fnParam.type !== "ArrayPattern") return
      const argNames = args.elements.map((element) => {
        return element && element.type === "Identifier" ? element.name : null
      })
      fnParam.elements.forEach((element, index) => {
        if (element && element.type === "Identifier") {
          const expectedName = `$${argNames[index]}`
          if (expectedName !== element.name) {
            context.report({
              node: fn,
              loc: {
                start: element.loc?.start ?? { line: 1, column: 0 },
                end: element.loc?.end ?? { line: 1, column: 0 },
              },
              messageId: "unexpected",
              data: { name: expectedName },
            })
          }
        }
      })
    }

    return {
      Program() {
        for (const { node } of extractStoreReferences(context, ["derived"])) {
          const [args, fn] = node.arguments
          if (!args || !isIdentifierOrArrayExpression(args)) continue
          if (!fn || !isFunctionExpression(fn)) continue
          if (!fn.params || fn.params.length === 0) continue
          if (args.type === "Identifier") checkIdentifier(context, args, fn)
          else checkArrayExpression(context, args, fn)
        }
      },
    }
  },
})
