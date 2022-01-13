import type { AST } from "svelte-eslint-parser"
import { parse as parseCss } from "postcss"
import { createRule } from "../utils"

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
          (v) => v.type === "SvelteMustacheTag",
        )
        const valueStartIndex = node.value[0].range[0]
        const cssCode = node.value
          .map((value) => {
            if (value.type === "SvelteMustacheTag") {
              return "_".repeat(value.range[1] - value.range[0])
            }
            return sourceCode.getText(value)
          })
          .join("")
        const root = parseCss(cssCode)
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
              const styleDirective = `style:${
                decl.prop
              }="${sourceCode.text.slice(...declValueRange)}"`
              if (root.nodes.length === 1 && root.nodes[0] === decl) {
                yield fixer.replaceTextRange(node.range, styleDirective)
              } else {
                yield fixer.removeRange(declRange)
                yield fixer.insertTextAfterRange(
                  node.range,
                  ` ${styleDirective}`,
                )
              }
            },
          })
        })
      },
    }
  },
})
