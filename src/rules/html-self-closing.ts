import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import {
  getNodeName,
  isCustomComponent,
  isVoidHtmlElement,
} from "../utils/template-utils"

enum TypeMessages {
  normal = "HTML elements",
  void = "HTML void elements",
  component = "Svelte custom components",
  unknown = "unknown elements",
}

export default createRule("html-self-closing", {
  meta: {
    docs: {
      description: "Enforce self-closing style",
      category: "Stylistic Issues",
      recommended: false,
      conflictWithPrettier: true,
    },
    type: "layout",
    fixable: "code",
    messages: {
      requireClosing: "Require self-closing on {{type}}",
      disallowClosing: "Disallow self-closing on {{type}}",
    },
    schema: [
      {
        type: "object",
        properties: {
          html: {
            type: "object",
            properties: {
              void: {
                enum: ["never", "always"],
              },
              normal: {
                enum: ["never", "always"],
              },
              component: {
                enum: ["never", "always"],
              },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(ctx) {
    const source = ctx.getSourceCode()
    const options: { [key: string]: "never" | "always" } = {
      void: ctx.options?.[0]?.html?.void ?? "never",
      normal: ctx.options?.[0]?.html?.normal ?? "always",
      component: ctx.options?.[0]?.html?.component ?? "always",
    }

    /**
     *
     */
    function getElementType(
      node: AST.SvelteElement,
    ): "component" | "void" | "normal" {
      if (isCustomComponent(node)) return "component"
      if (isVoidHtmlElement(node)) return "void"
      return "normal"
    }

    /**
     *
     */
    function elementTypeMessages(
      type: "component" | "void" | "normal",
    ): TypeMessages {
      switch (type) {
        case "component":
          return TypeMessages.component
        case "normal":
          return TypeMessages.normal
        case "void":
          return TypeMessages.void
        default:
          return TypeMessages.unknown
      }
    }

    /**
     *
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
     *
     */
    function report(node: AST.SvelteElement, close: boolean) {
      const elementType = getElementType(node)

      ctx.report({
        node,
        messageId: close ? "requireClosing" : "disallowClosing",
        data: {
          type: elementTypeMessages(elementType),
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

        // if (elementType === "void") return
        const shouldBeClosed = options[elementType] === "always"
        const startTagSrc = source.getText(node.startTag)
        const selfClosing =
          startTagSrc.slice(
            Math.max(startTagSrc.length - 2, 0),
            Math.max(startTagSrc.length - 1, 0),
          ) === "/"

        if (shouldBeClosed && !selfClosing) {
          report(node, true)
        } else if (!shouldBeClosed && selfClosing) {
          report(node, false)
        }
      },
    }
  },
})
