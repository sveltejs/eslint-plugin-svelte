import type { AST } from "svelte-eslint-parser"
import { isNotClosingBraceToken, isNotOpeningBraceToken } from "eslint-utils"
import type { NodeOrToken } from "../types"
import { createRule } from "../utils"

const QUOTE_CHARS = {
  double: '"',
  single: "'",
}
const QUOTE_NAMES = {
  double: "double quotes",
  single: "single quotes",
  unquoted: "unquoted",
}

export default createRule("html-quotes", {
  meta: {
    docs: {
      description: "enforce quotes style of HTML attributes",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          prefer: { enum: ["double", "single"] },
          dynamic: {
            type: "object",
            properties: {
              quoted: { type: "boolean" },
              avoidInvalidUnquotedInHTML: { type: "boolean" },
            },
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      expectedEnclosed: "Expected to be enclosed by quotes.",
      expectedEnclosedBy: "Expected to be enclosed by {{kind}}.",
      unexpectedEnclosed: "Unexpected to be enclosed by any quotes.",
    },
    type: "layout", // "problem",
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    const preferQuote: "double" | "single" =
      context.options[0]?.prefer ?? "double"
    const dynamicQuote = context.options[0]?.dynamic?.quoted
      ? preferQuote
      : "unquoted"
    const avoidInvalidUnquotedInHTML = Boolean(
      context.options[0]?.dynamic?.avoidInvalidUnquotedInHTML,
    )

    type QuoteAndRange = {
      quote: "unquoted" | "double" | "single"
      range: [number, number]
    }

    /** Get the quote and range from given attribute values */
    function getQuoteAndRange(
      attr:
        | AST.SvelteAttribute
        | AST.SvelteDirective
        | AST.SvelteSpecialDirective,
      valueTokens: NodeOrToken[],
    ): QuoteAndRange | null {
      const valueFirstToken = valueTokens[0]
      const valueLastToken = valueTokens[valueTokens.length - 1]
      const eqToken = sourceCode.getTokenAfter(attr.key)
      if (
        !eqToken ||
        eqToken.value !== "=" ||
        valueFirstToken.range![0] < eqToken.range[1]
      ) {
        // invalid
        return null
      }
      const beforeTokens = sourceCode.getTokensBetween(eqToken, valueFirstToken)
      if (beforeTokens.length === 0) {
        return {
          quote: "unquoted",
          range: [valueFirstToken.range![0], valueLastToken.range![1]],
        }
      } else if (
        beforeTokens.length > 1 ||
        (beforeTokens[0].value !== '"' && beforeTokens[0].value !== "'")
      ) {
        // invalid
        return null
      }
      const beforeToken = beforeTokens[0]
      const afterToken = sourceCode.getTokenAfter(valueLastToken)
      if (!afterToken || afterToken.value !== beforeToken.value) {
        // invalid
        return null
      }

      return {
        quote: beforeToken.value === '"' ? "double" : "single",
        range: [beforeToken.range[0], afterToken.range[1]],
      }
    }

    /** Checks whether the given text can remove quotes in HTML. */
    function canBeUnquotedInHTML(text: string) {
      return !/[\s"'<=>`]/u.test(text)
    }

    /** Verify quote */
    function verifyQuote(
      prefer: "double" | "single" | "unquoted",
      quoteAndRange: QuoteAndRange | null,
    ) {
      if (!quoteAndRange) {
        // invalid
        return
      }
      if (quoteAndRange.quote === prefer) {
        // valid
        return
      }

      let messageId: string
      let expectedQuote = prefer
      if (quoteAndRange.quote !== "unquoted") {
        if (expectedQuote === "unquoted") {
          messageId = "unexpectedEnclosed"
        } else {
          const contentText = sourceCode.text.slice(
            quoteAndRange.range[0] + 1,
            quoteAndRange.range[1] - 1,
          )
          const needEscape = contentText.includes(QUOTE_CHARS[expectedQuote])
          if (needEscape) {
            // avoid escape
            return
          }
          messageId = "expectedEnclosedBy"
        }
      } else {
        const contentText = sourceCode.text.slice(...quoteAndRange.range)
        const needEscapeDoubleQuote = contentText.includes('"')
        const needEscapeSingleQuote = contentText.includes("'")
        if (needEscapeDoubleQuote && needEscapeSingleQuote) {
          // avoid escape
          return
        }
        if (needEscapeDoubleQuote && expectedQuote === "double") {
          expectedQuote = "single"
          messageId = "expectedEnclosed"
        } else if (needEscapeSingleQuote && expectedQuote === "single") {
          expectedQuote = "double"
          messageId = "expectedEnclosed"
        } else {
          messageId = "expectedEnclosedBy"
        }
      }

      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(quoteAndRange.range[0]),
          end: sourceCode.getLocFromIndex(quoteAndRange.range[1]),
        },
        messageId,
        data: { kind: QUOTE_NAMES[expectedQuote] },
        *fix(fixer) {
          if (expectedQuote !== "unquoted") {
            yield fixer.insertTextBeforeRange(
              [quoteAndRange.range[0], quoteAndRange.range[0]],
              QUOTE_CHARS[expectedQuote],
            )
          }
          if (quoteAndRange.quote !== "unquoted") {
            yield fixer.removeRange([
              quoteAndRange.range[0],
              quoteAndRange.range[0] + 1,
            ])
            yield fixer.removeRange([
              quoteAndRange.range[1] - 1,
              quoteAndRange.range[1],
            ])
          }

          if (expectedQuote !== "unquoted") {
            yield fixer.insertTextAfterRange(
              [quoteAndRange.range[1], quoteAndRange.range[1]],
              QUOTE_CHARS[expectedQuote],
            )
          }
        },
      })
    }

    /** Verify for standard attribute */
    function verifyForValues(
      attr: AST.SvelteAttribute,
      valueNodes: AST.SvelteAttribute["value"],
    ) {
      const quoteAndRange = getQuoteAndRange(attr, valueNodes)
      verifyQuote(preferQuote, quoteAndRange)
    }

    /** Verify for dynamic attribute */
    function verifyForDynamicMustacheTag(
      attr: AST.SvelteAttribute,
      valueNode: AST.SvelteMustacheTag & {
        kind: "text"
      },
    ) {
      const quoteAndRange = getQuoteAndRange(attr, [valueNode])
      const text = sourceCode.text.slice(...valueNode.range)
      verifyQuote(
        avoidInvalidUnquotedInHTML && !canBeUnquotedInHTML(text)
          ? preferQuote
          : dynamicQuote,
        quoteAndRange,
      )
    }

    /** Verify for directive value */
    function verifyForDirective(
      attr: AST.SvelteDirective | AST.SvelteSpecialDirective,
      valueNode: NonNullable<AST.SvelteDirective["expression"]>,
    ) {
      const beforeToken = sourceCode.getTokenBefore(valueNode)
      const afterToken = sourceCode.getTokenAfter(valueNode)
      if (
        !beforeToken ||
        !afterToken ||
        isNotOpeningBraceToken(beforeToken) ||
        isNotClosingBraceToken(afterToken)
      ) {
        return
      }
      const quoteAndRange = getQuoteAndRange(attr, [beforeToken, afterToken])
      const text = sourceCode.text.slice(
        beforeToken.range[0],
        afterToken.range[1],
      )
      verifyQuote(
        avoidInvalidUnquotedInHTML && !canBeUnquotedInHTML(text)
          ? preferQuote
          : dynamicQuote,
        quoteAndRange,
      )
    }

    return {
      SvelteAttribute(node) {
        if (
          node.value.length === 1 &&
          node.value[0].type === "SvelteMustacheTag"
        ) {
          verifyForDynamicMustacheTag(node, node.value[0])
        } else if (node.value.length >= 1) {
          verifyForValues(node, node.value)
        }
      },
      "SvelteDirective, SvelteSpecialDirective"(
        node: AST.SvelteDirective | AST.SvelteSpecialDirective,
      ) {
        if (node.expression == null) {
          return
        }
        if (
          node.key.range[0] <= node.expression.range![0] &&
          node.expression.range![1] <= node.key.range[1]
        ) {
          // shorthand
          return
        }
        verifyForDirective(node, node.expression)
      },
    }
  },
})
