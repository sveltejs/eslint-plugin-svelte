import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import { createRule } from "../utils"
import type { SvelteStyleRoot } from "../utils/css-utils"
import { parseStyleAttributeValue, safeParseCss } from "../utils/css-utils"

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
      root: SvelteStyleRoot,
      mustacheTags: AST.SvelteMustacheTagText[],
    ) {
      root.walk((decl) => {
        if (decl.type !== "decl" || decl.important) return
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

        if (
          mustacheTags.some(
            (tag) =>
              (tag.range[0] < decl.range[0] && decl.range[0] < tag.range[1]) ||
              (tag.range[0] < decl.range[1] && decl.range[1] < tag.range[1]),
          )
        ) {
          // intersection
          return
        }

        context.report({
          node,
          messageId: "unexpected",
          *fix(fixer) {
            const styleDirective = `style:${decl.prop}="${sourceCode.text.slice(
              ...decl.valueRange,
            )}"`
            if (root.nodes.length === 1 && root.nodes[0] === decl) {
              yield fixer.replaceTextRange(node.range, styleDirective)
            } else {
              yield fixer.removeRange(decl.range)
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
      root: SvelteStyleRoot | null,
    ) {
      for (const mustacheTag of mustacheTags) {
        processMustacheTag(mustacheTag, attrNode, root)
      }
    }

    /**
     * Process for `style="{a ? 'color: red;': ''}"`
     */
    function processMustacheTag(
      mustacheTag: AST.SvelteMustacheTagText,
      attrNode: AST.SvelteAttribute,
      root: SvelteStyleRoot | null,
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

      if (root) {
        let foundIntersection = false
        root.walk((n) => {
          if (
            mustacheTag.range[0] < n.range[1] &&
            n.range[0] < mustacheTag.range[1]
          ) {
            foundIntersection = true
          }
        })
        if (foundIntersection) {
          return
        }
      }

      const positive = node.alternate.value === ""
      const inlineRoot = safeParseCss(
        positive ? node.consequent.value : node.alternate.value,
      )
      if (!inlineRoot || inlineRoot.nodes.length !== 1) {
        return
      }
      const decl = inlineRoot.nodes[0]
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
        const root = parseStyleAttributeValue(node, context)
        if (root) {
          processStyleValue(node, root, mustacheTags)
        }
        processMustacheTags(mustacheTags, node, root)
      },
    }
  },
})
