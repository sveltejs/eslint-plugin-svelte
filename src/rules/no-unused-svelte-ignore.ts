import type { AST } from "svelte-eslint-parser"
import { isOpeningParenToken } from "eslint-utils"
import type { Warning } from "../shared/svelte-compile-warns"
import { getSvelteCompileWarnings } from "../shared/svelte-compile-warns"
import { createRule } from "../utils"
import type { ASTNodeWithParent } from "../types"
import type { IgnoreItem } from "../shared/svelte-compile-warns/ignore-comment"
import { getSvelteIgnoreItems } from "../shared/svelte-compile-warns/ignore-comment"

const CSS_WARN_CODES = new Set([
  "css-unused-selector",
  "css-invalid-global",
  "css-invalid-global-selector",
])

export default createRule("no-unused-svelte-ignore", {
  meta: {
    docs: {
      description: "disallow unused svelte-ignore comments",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
    messages: {
      unused: "svelte-ignore comment is used, but not warned",
      missingCode: "svelte-ignore comment must include the code",
    },
    type: "suggestion",
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    const ignoreComments: IgnoreItem[] = []
    for (const item of getSvelteIgnoreItems(context)) {
      if (item.code == null) {
        context.report({
          node: item.token,
          messageId: "missingCode",
        })
      } else {
        ignoreComments.push(item)
      }
    }

    if (!ignoreComments.length) {
      return {}
    }

    const warnings = getSvelteCompileWarnings(context, {
      removeComments: new Set(ignoreComments.map((i) => i.token)),
    })
    if (warnings.kind === "error") {
      return {}
    }
    const used = new Set<IgnoreItem>()
    for (const warning of warnings.warnings) {
      if (!warning.code) {
        continue
      }
      const node = getWarningNode(warning)
      if (!node) {
        continue
      }
      for (const comment of extractLeadingComments(node).reverse()) {
        const ignoreItem = ignoreComments.find(
          (item) => item.token === comment && item.code === warning.code,
        )
        if (ignoreItem) {
          used.add(ignoreItem)
        }
      }
    }

    // Stripped styles are ignored from compilation and cannot determine css errors.
    for (const node of warnings.stripStyleElements) {
      for (const comment of extractLeadingComments(node).reverse()) {
        const ignoreItem = ignoreComments.find(
          (item) => item.token === comment && CSS_WARN_CODES.has(item.code),
        )
        if (ignoreItem) {
          used.add(ignoreItem)
        }
      }
    }

    for (const unused of ignoreComments.filter((i) => !used.has(i))) {
      context.report({
        loc: {
          start: sourceCode.getLocFromIndex(unused.range[0]),
          end: sourceCode.getLocFromIndex(unused.range[1]),
        },
        messageId: "unused",
      })
    }
    return {}

    /** Get warning node */
    function getWarningNode(warning: Warning) {
      const index = getWarningIndex(warning)
      if (index == null) {
        return null
      }
      let targetNode = sourceCode.getNodeByRangeIndex(index)
      while (targetNode) {
        if (
          targetNode.type === "SvelteElement" ||
          targetNode.type === "SvelteStyleElement"
        ) {
          return targetNode
        }
        if (targetNode.parent) {
          if (
            targetNode.parent.type === "Program" ||
            targetNode.parent.type === "SvelteScriptElement"
          ) {
            return targetNode
          }
        } else {
          return null
        }
        targetNode = targetNode.parent || null
      }

      return null
    }

    /** Get warning index */
    function getWarningIndex(warning: Warning) {
      const start = warning.start && sourceCode.getIndexFromLoc(warning.start)
      const end = warning.end && sourceCode.getIndexFromLoc(warning.end)
      if (start != null && end != null) {
        return Math.floor(start + (end - start) / 2)
      }
      return start ?? end
    }

    /** Extract comments */
    function extractLeadingComments(node: ASTNodeWithParent) {
      const beforeToken = sourceCode.getTokenBefore(node, {
        includeComments: false,
        filter(token) {
          if (isOpeningParenToken(token)) {
            return false
          }
          const astToken = token as AST.Token
          if (astToken.type === "HTMLText") {
            return Boolean(astToken.value.trim())
          }
          return astToken.type !== "HTMLComment"
        },
      })
      if (beforeToken) {
        return sourceCode
          .getTokensBetween(beforeToken, node, { includeComments: true })
          .filter(isComment)
      }
      return sourceCode
        .getTokensBefore(node, { includeComments: true })
        .filter(isComment)
    }
  },
})

/** Checks whether given token is comment token */
function isComment(token: AST.Token | AST.Comment): boolean {
  return (
    token.type === "HTMLComment" ||
    token.type === "Block" ||
    token.type === "Line"
  )
}
