import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import { createRule } from "../utils"
import {
  findVariable,
  getAttributeValueQuoteAndRange,
  getStringIfConstant,
} from "../utils/ast-utils"

export default createRule("no-dynamic-slot-name", {
  meta: {
    docs: {
      description: "disallow dynamic slot name",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "`<slot>` name cannot be dynamic.",
      requireValue: "`<slot>` name requires a value.",
    },
    type: "problem",
  },
  create(context) {
    return {
      "SvelteElement[name.name='slot'] > SvelteStartTag.startTag > SvelteAttribute[key.name='name']"(
        node: AST.SvelteAttribute,
      ) {
        if (node.value.length === 0) {
          context.report({
            node,
            messageId: "requireValue",
          })
          return
        }
        for (const vNode of node.value) {
          if (vNode.type === "SvelteMustacheTag") {
            context.report({
              node: vNode,
              messageId: "unexpected",
              fix(fixer) {
                const text = getStaticText(vNode.expression)
                if (text == null) {
                  return null
                }

                if (node.value.length === 1) {
                  const range = getAttributeValueQuoteAndRange(
                    node,
                    context,
                  )!.range
                  return fixer.replaceTextRange(range, `"${text}"`)
                }
                const range = vNode.range
                return fixer.replaceTextRange(range, text)
              },
            })
          }
        }
      },
    }

    /**
     * Get static text from given expression
     */
    function getStaticText(node: ESTree.Expression) {
      const expr = findRootExpression(node)
      return getStringIfConstant(expr)
    }

    /** Find data expression */
    function findRootExpression(
      node: ESTree.Expression,
      already = new Set<ESTree.Identifier>(),
    ): ESTree.Expression {
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
  },
})
