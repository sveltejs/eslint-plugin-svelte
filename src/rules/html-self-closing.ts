import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { getNodeName, isVoidHtmlElement } from "../utils/ast-utils"

const TYPE_MESSAGES = {
  normal: "HTML elements",
  void: "HTML void elements",
  component: "Svelte custom components",
  svelte: "Svelte special elements",
}

type ElementTypes = "normal" | "void" | "component" | "svelte"

export default createRule("html-self-closing", {
  meta: {
    docs: {
      description: "enforce self-closing style",
      category: "Stylistic Issues",
      recommended: false,
      conflictWithPrettier: true,
    },
    type: "layout",
    fixable: "code",
    messages: {
      requireClosing: "Require self-closing on {{type}}.",
      disallowClosing: "Disallow self-closing on {{type}}.",
    },
    schema: [
      {
        type: "object",
        properties: {
          void: {
            enum: ["never", "always", "ignore"],
          },
          normal: {
            enum: ["never", "always", "ignore"],
          },
          component: {
            enum: ["never", "always", "ignore"],
          },
          svelte: {
            enum: ["never", "always", "ignore"],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(ctx) {
    const options = {
      void: "always",
      normal: "always",
      component: "always",
      svelte: "always",
      ...ctx.options?.[0],
    }

    /**
     * Get SvelteElement type.
     * If element is custom component "component" is returned
     * If element is svelte special element such as svelte:self "svelte" is returned
     * If element is void element "void" is returned
     * otherwise "normal" is returned
     */
    function getElementType(node: AST.SvelteElement): ElementTypes {
      if (node.kind === "component") return "component"
      if (node.kind === "special") return "svelte"
      if (isVoidHtmlElement(node)) return "void"
      return "normal"
    }

    /**
     * Returns true if element has no children, or has only whitespace text
     */
    function isElementEmpty(node: AST.SvelteElement): boolean {
      if (node.children.length <= 0) return true

      for (const child of node.children) {
        if (child.type !== "SvelteText") return false
        if (!/^\s*$/.test(child.value)) return false
      }

      return true
    }

    /**
     * Report
     */
    function report(node: AST.SvelteElement, close: boolean) {
      const elementType = getElementType(node)

      ctx.report({
        node,
        messageId: close ? "requireClosing" : "disallowClosing",
        data: {
          type: TYPE_MESSAGES[elementType],
        },
        *fix(fixer) {
          if (close) {
            for (const child of node.children) {
              yield fixer.removeRange(child.range)
            }

            yield fixer.insertTextBeforeRange(
              [node.startTag.range[1] - 1, node.startTag.range[1]],
              "/",
            )

            if (node.endTag) yield fixer.removeRange(node.endTag.range)
          } else {
            yield fixer.removeRange([
              node.startTag.range[1] - 2,
              node.startTag.range[1] - 1,
            ])

            if (!isVoidHtmlElement(node))
              yield fixer.insertTextAfter(node, `</${getNodeName(node)}>`)
          }
        },
      })
    }

    return {
      SvelteElement(node: AST.SvelteElement) {
        if (!isElementEmpty(node)) return

        const elementType = getElementType(node)

        const elementTypeOptions = options[elementType]
        if (elementTypeOptions === "ignore") return
        const shouldBeClosed = elementTypeOptions === "always"

        if (shouldBeClosed && !node.startTag.selfClosing) {
          report(node, true)
        } else if (!shouldBeClosed && node.startTag.selfClosing) {
          report(node, false)
        }
      },
    }
  },
})
