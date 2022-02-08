import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import type { Root } from "postcss"
import { parse as parseCss } from "postcss"
import { createRule } from "../utils"

/** Parse for CSS */
function safeParseCss(cssCode: string) {
  try {
    return parseCss(cssCode)
  } catch {
    return null
  }
}

/** Checks wether the given node is string literal or not  */
function isStringLiteral(
  node: ESTree.Expression,
): node is ESTree.Literal & { value: string } {
  return node.type === "Literal" && typeof node.value === "string"
}

export default createRule("prefer-style-directive", {
  meta: {
    docs: {
      description: "require style directives instead of style attribute",
      category: "Stylistic Issues",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "Can use style directives instead.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    /**
     * Process for `style=" ... "`
     */
    function processStyleValue(
      node: AST.SvelteAttribute,
      root: Root,
      mustacheTags: AST.SvelteMustacheTagText[],
    ) {
      const valueStartIndex = node.value[0].range[0]

      root.walkDecls((decl) => {
        if (
          node.parent.attributes.some(
            (attr) =>
              attr.type === "SvelteStyleDirective" &&
              attr.key.name.name === decl.prop,
          )
        ) {
          // has style directive
          return
        }

        const declRange: AST.Range = [
          valueStartIndex + decl.source!.start!.offset,
          valueStartIndex + decl.source!.end!.offset + 1,
        ]
        if (
          mustacheTags.some(
            (tag) =>
              (tag.range[0] < declRange[0] && declRange[0] < tag.range[1]) ||
              (tag.range[0] < declRange[1] && declRange[1] < tag.range[1]),
          )
        ) {
          // intersection
          return
        }
        const declValueStartIndex =
          declRange[0] + decl.prop.length + (decl.raws.between || "").length
        const declValueRange: AST.Range = [
          declValueStartIndex,
          declValueStartIndex + (decl.raws.value?.value || decl.value).length,
        ]

        context.report({
          node,
          messageId: "unexpected",
          *fix(fixer) {
            const styleDirective = `style:${decl.prop}="${sourceCode.text.slice(
              ...declValueRange,
            )}"`
            if (root.nodes.length === 1 && root.nodes[0] === decl) {
              yield fixer.replaceTextRange(node.range, styleDirective)
            } else {
              yield fixer.removeRange(declRange)
              yield fixer.insertTextAfterRange(node.range, ` ${styleDirective}`)
            }
          },
        })
      })
    }

    /**
     * Process for `style="{a ? 'color: red;': ''}"`
     */
    function processMustacheTags(
      mustacheTags: AST.SvelteMustacheTagText[],
      attrNode: AST.SvelteAttribute,
    ) {
      for (const mustacheTag of mustacheTags) {
        processMustacheTag(mustacheTag, attrNode)
      }
    }

    /**
     * Process for `style="{a ? 'color: red;': ''}"`
     */
    function processMustacheTag(
      mustacheTag: AST.SvelteMustacheTagText,
      attrNode: AST.SvelteAttribute,
    ) {
      const node = mustacheTag.expression

      if (node.type !== "ConditionalExpression") {
        return
      }
      if (
        !isStringLiteral(node.consequent) ||
        !isStringLiteral(node.alternate)
      ) {
        return
      }
      if (node.consequent.value && node.alternate.value) {
        // e.g. t ? 'top: 20px' : 'left: 30px'
        return
      }
      const positive = node.alternate.value === ""
      const root = safeParseCss(
        positive ? node.consequent.value : node.alternate.value,
      )
      if (!root || root.nodes.length !== 1) {
        return
      }
      const decl = root.nodes[0]
      if (decl.type !== "decl") {
        return
      }
      if (
        attrNode.parent.attributes.some(
          (attr) =>
            attr.type === "SvelteStyleDirective" &&
            attr.key.name.name === decl.prop,
        )
      ) {
        // has style directive
        return
      }

      context.report({
        node,
        messageId: "unexpected",
        *fix(fixer) {
          let valueText = sourceCode.text.slice(
            node.test.range![0],
            node.consequent.range![0],
          )
          if (positive) {
            valueText +=
              sourceCode.text[node.consequent.range![0]] +
              decl.value +
              sourceCode.text[node.consequent.range![1] - 1]
          } else {
            valueText += "null"
          }
          valueText += sourceCode.text.slice(
            node.consequent.range![1],
            node.alternate.range![0],
          )
          if (positive) {
            valueText += "null"
          } else {
            valueText +=
              sourceCode.text[node.alternate.range![0]] +
              decl.value +
              sourceCode.text[node.alternate.range![1] - 1]
          }
          const styleDirective = `style:${decl.prop}={${valueText}}`
          if (
            attrNode.value
              .filter((v) => v !== mustacheTag)
              .every((v) => v.type === "SvelteLiteral" && !v.value.trim())
          ) {
            yield fixer.replaceTextRange(attrNode.range, styleDirective)
          } else {
            const first = attrNode.value[0]
            if (first !== mustacheTag) {
              yield fixer.replaceTextRange(
                [first.range[0], mustacheTag.range[0]],
                sourceCode.text
                  .slice(first.range[0], mustacheTag.range[0])
                  .trimEnd(),
              )
            }
            yield fixer.removeRange(mustacheTag.range)
            yield fixer.insertTextAfterRange(
              attrNode.range,
              ` ${styleDirective}`,
            )
          }
        },
      })
    }

    return {
      "SvelteStartTag > SvelteAttribute"(
        node: AST.SvelteAttribute & {
          parent: AST.SvelteStartTag
        },
      ) {
        if (node.key.name !== "style") {
          return
        }
        const mustacheTags = node.value.filter(
          (v): v is AST.SvelteMustacheTagText => v.type === "SvelteMustacheTag",
        )
        const cssCode = node.value
          .map((value) => {
            if (value.type === "SvelteMustacheTag") {
              return "_".repeat(value.range[1] - value.range[0])
            }
            return sourceCode.getText(value)
          })
          .join("")
        const root = safeParseCss(cssCode)
        if (root) {
          processStyleValue(node, root, mustacheTags)
        } else {
          processMustacheTags(mustacheTags, node)
        }
      },
    }
  },
})
