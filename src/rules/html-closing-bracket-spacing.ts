import { createRule } from "../utils"
import type { AST } from "svelte-eslint-parser"

export default createRule("html-closing-bracket-spacing", {
  meta: {
    docs: {
      description: "Require or disallow a space before tag's closing brackets",
      category: "Stylistic Issues",
      conflictWithPrettier: true,
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          startTag: {
            enum: ["always", "never", "any"],
          },
          endTag: {
            enum: ["always", "never", "any"],
          },
          selfClosingTag: {
            enum: ["always", "never", "any"],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedSpace: "Expected space before '>', but not found.",
      unexpectedSpace: "Expected no space before '>', but found.",
    },
    fixable: "code",
    type: "layout",
  },
  create(ctx) {
    const options = {
      startTag: "never",
      endTag: "never",
      selfClosingTag: "always",
      ...ctx.options[0],
    }
    const src = ctx.getSourceCode()

    /**
     * Returns true if string contains newline characters
     */
    function containsNewline(string: string): boolean {
      return /.*\n.*/s.test(string)
    }

    /**
     * Returns true if string contains whitespace characters
     */
    function containsWhitespace(string: string): boolean {
      return /.*\s.*/s.test(string)
    }

    /**
     * Report
     */
    function report(
      node: AST.SvelteStartTag | AST.SvelteEndTag,
      shouldHave: boolean,
    ) {
      const tagSrc = src.getText(node)
      const match = /(\s*)\/?>$/m.exec(tagSrc)

      const end = node.range[1]
      const start = node.range[1] - match![0].length
      const loc = {
        start: src.getLocFromIndex(start),
        end: src.getLocFromIndex(end),
      }

      ctx.report({
        loc,
        messageId: shouldHave ? "expectedSpace" : "unexpectedSpace",
        *fix(fixer) {
          if (shouldHave) {
            yield fixer.insertTextBeforeRange([start, end], " ")
          } else {
            const spaces = match![1]

            yield fixer.removeRange([start, start + spaces.length])
          }
        },
      })
    }

    return {
      "SvelteStartTag, SvelteEndTag"(
        node: AST.SvelteStartTag | AST.SvelteEndTag,
      ) {
        if (node.type === "SvelteEndTag" && options.endTag === "any") return

        const tagSrc = src.getText(node)
        const selfClosing =
          tagSrc.slice(
            Math.max(tagSrc.length - 2, 0),
            Math.max(tagSrc.length - 1, 0),
          ) === "/"

        const tagType =
          node.type === "SvelteEndTag"
            ? "endTag"
            : selfClosing
            ? "selfClosingTag"
            : "startTag"

        if (node.type === "SvelteStartTag" && options[tagType] === "any") return

        const match = /(\s*)\/?>$/m.exec(tagSrc)
        if (containsNewline(match![1])) return

        if (options[tagType] === "always" && !containsWhitespace(match![1])) {
          report(node, true)
        } else if (
          options[tagType] === "never" &&
          containsWhitespace(match![1])
        ) {
          report(node, false)
        }
      },
    }
  },
})
