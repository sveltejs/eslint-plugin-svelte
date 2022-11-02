import type { AST } from "svelte-eslint-parser"
import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"
import { findVariable } from "../utils/ast-utils"

const PHRASES = {
  ObjectExpression: "object",
  ArrayExpression: "array",
  ClassExpression: "class",
  Literal(node: TSESTree.Literal): string | null {
    if ("regex" in node) {
      return "regex value"
    }
    if ("bigint" in node) {
      return "bigint value"
    }
    if (node.value == null) {
      return null
    }
    return `${typeof node.value} value`
  },
  TemplateLiteral: "string value",
}
export default createRule("no-not-function-handler", {
  meta: {
    docs: {
      description: "disallow use of not function in event handler",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {
      unexpected: "Unexpected {{phrase}} in event handler.",
    },
    type: "problem", // "problem", or "layout",
  },
  create(context) {
    /** Find data expression */
    function findRootExpression(
      node: TSESTree.Expression,
      already = new Set<TSESTree.Identifier>(),
    ): TSESTree.Expression {
      if (node.type !== "Identifier" || already.has(node)) {
        return node
      }
      already.add(node)
      const variable = findVariable(context, node)
      if (!variable || variable.defs.length !== 1) {
        return node
      }
      const def = variable.defs[0]
      if (def.type === "Variable") {
        if (def.parent.kind === "const" && def.node.init) {
          const init = def.node.init
          return findRootExpression(init, already)
        }
      }
      return node
    }

    /** Verify for `on:` directive value */
    function verify(node: AST.SvelteEventHandlerDirective["expression"]) {
      if (!node) {
        return
      }
      const expression = findRootExpression(node)

      if (
        expression.type !== "ObjectExpression" &&
        expression.type !== "ArrayExpression" &&
        expression.type !== "ClassExpression" &&
        expression.type !== "Literal" &&
        expression.type !== "TemplateLiteral"
      ) {
        return
      }
      const phraseValue = PHRASES[expression.type]
      const phrase =
        typeof phraseValue === "function"
          ? phraseValue(expression as never)
          : phraseValue
      if (phrase == null) {
        return
      }
      context.report({
        node,
        messageId: "unexpected",
        data: {
          phrase,
        },
      })
    }

    return {
      SvelteDirective(node) {
        if (node.kind !== "EventHandler") {
          return
        }
        verify(node.expression)
      },
    }
  },
})
