import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import { createRule } from "../utils"
import { getStringIfConstant, needParentheses } from "../utils/ast-utils"

export default createRule("prefer-class-directive", {
  meta: {
    docs: {
      description: "require class directives instead of ternary expressions",
      recommended: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "Unexpected class using the ternary operator.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.getSourceCode()

    type Expr = {
      not?: true
      node: ESTree.Expression
      chains?: Expr
    }

    /**
     * Returns a map of expressions and strings from ConditionalExpression.
     * Returns null if it has an unknown string.
     */
    function parseConditionalExpression(
      node: ESTree.ConditionalExpression,
    ): Map<Expr, string> | null {
      const result = new Map<Expr, string>()

      if (
        !processItems(
          {
            node: node.test,
          },
          node.consequent,
        )
      ) {
        return null
      }
      if (
        !processItems(
          {
            not: true,
            node: node.test,
          },
          node.alternate,
        )
      ) {
        return null
      }

      return result

      /** Process items */
      function processItems(key: Expr, e: ESTree.Expression) {
        if (e.type === "ConditionalExpression") {
          const sub = parseConditionalExpression(e)
          if (sub == null) {
            return false
          }
          for (const [expr, str] of sub) {
            result.set(
              {
                ...key,
                chains: expr,
              },
              str,
            )
          }
        } else {
          const str = getStringIfConstant(e)
          if (str == null) {
            return false
          }
          result.set(key, str)
        }
        return true
      }
    }

    /**
     * Expr to string
     */
    function exprToString({ node, not }: Expr): string {
      let text = sourceCode.text.slice(...node.range!)

      // *Currently not supported.
      // if (chains) {
      //   if (needParentheses(node, "logical")) {
      //     text = `(${text})`
      //   }
      //   let chainsText = exprToString(chains)
      //   const needParenForChains =
      //     !/^[!(]/u.test(chainsText) && needParentheses(chains.node, "logical")
      //   if (needParenForChains) {
      //     chainsText = `(${chainsText})`
      //   }
      //   text = `${text} && ${chainsText}`
      //   if (not) {
      //     text = `!(${text})`
      //   }
      //   return text
      // }
      if (not) {
        if (node.type === "BinaryExpression") {
          if (
            node.operator === "===" ||
            node.operator === "==" ||
            node.operator === "!==" ||
            node.operator === "!="
          ) {
            const left = sourceCode.text.slice(...node.left.range!)
            const op = sourceCode.text.slice(
              node.left.range![1],
              node.right.range![0],
            )
            const right = sourceCode.text.slice(...node.right.range!)

            return `${left}${
              node.operator === "===" || node.operator === "=="
                ? op.replace(/[=](={1,2})/g, "!$1")
                : op.replace(/!(={1,2})/g, "=$1")
            }${right}`
          }
        } else if (node.type === "UnaryExpression") {
          if (node.operator === "!" && node.prefix) {
            return sourceCode.text.slice(...node.argument.range!)
          }
        }

        if (needParentheses(node, "not")) {
          text = `(${text})`
        }
        text = `!${text}`
      }
      return text
    }

    /**
     * Returns all possible strings.
     */
    function getStrings(node: AST.SvelteAttribute["value"][number]) {
      if (node.type === "SvelteText") {
        return [node.value]
      }
      if (node.expression.type === "ConditionalExpression") {
        const values = parseConditionalExpression(node.expression)
        if (values == null) {
          // unknown
          return null
        }
        return [...values.values()]
      }
      const str = getStringIfConstant(node.expression)
      if (str == null) {
        // unknown
        return null
      }
      return [str]
    }

    /**
     * Checks if the last character is a non word.
     */
    function endsWithNonWord(
      node: AST.SvelteAttribute,
      index: number,
    ): boolean {
      for (let i = index; i >= 0; i--) {
        const valueNode = node.value[i]
        const strings = getStrings(valueNode)
        if (strings == null) {
          // unknown
          return false
        }
        for (const str of strings) {
          if (str) {
            return !str[str.length - 1].trim()
          }
        }
        // If the string is empty, check the previous string.
      }
      return true
    }

    /**
     * Checks if the first character is a non word.
     */
    function startsWithNonWord(
      node: AST.SvelteAttribute,
      index: number,
    ): boolean {
      for (let i = index; i < node.value.length; i++) {
        const valueNode = node.value[i]
        const strings = getStrings(valueNode)
        if (strings == null) {
          // unknown
          return false
        }
        for (const str of strings) {
          if (str) {
            return !str[0].trim()
          }
        }
        // If the string is empty, check the previous string.
      }
      return true
    }

    /** Report */
    function report(
      node: AST.SvelteMustacheTag,
      map: Map<Expr, string>,
      attr: AST.SvelteAttribute,
    ) {
      context.report({
        node,
        messageId: "unexpected",
        *fix(fixer) {
          const classDirectives: string[] = []
          let space = " "
          for (const [expr, className] of map) {
            const trimmedClassName = className.trim()
            if (trimmedClassName) {
              classDirectives.push(
                `class:${trimmedClassName}={${exprToString(expr)}}`,
              )
            } else {
              space = className
            }
          }
          if (attr.value.length === 1) {
            yield fixer.replaceText(attr, classDirectives.join(" "))
          } else {
            yield fixer.replaceText(node, space)
            yield fixer.insertTextAfterRange(
              [attr.range[1], attr.range[1]],
              ` ${classDirectives.join(" ")}`,
            )
          }
        },
      })
    }

    /** verify */
    function verify(
      node: AST.SvelteMustacheTag,
      index: number,
      attr: AST.SvelteAttribute,
    ) {
      if (node.expression.type !== "ConditionalExpression") {
        return
      }
      const map = parseConditionalExpression(node.expression)
      if (map == null) {
        // has unknown
        return
      }
      if (map.size > 2) {
        // It's too complicated.
        return
      }
      const prevIsWord = !startsWithNonWord(attr, index + 1)
      const nextIsWord = !endsWithNonWord(attr, index - 1)
      let canTransform = true
      for (const className of map.values()) {
        if (className) {
          if (!/^\s*[\w-]*\s*$/u.test(className)) {
            // Cannot be transformed to an attribute.
            canTransform = false
            break
          }
          if (
            (className[0].trim() && prevIsWord) ||
            (className[className.length - 1].trim() && nextIsWord)
          ) {
            // The previous or next may be connected to this element.
            canTransform = false
            break
          }
        } else {
          if (prevIsWord && nextIsWord) {
            // The previous and next may be connected.
            canTransform = false
            break
          }
        }
      }
      if (!canTransform) {
        return
      }
      report(node, map, attr)
    }

    return {
      "SvelteElement > SvelteAttribute"(
        node: AST.SvelteAttribute & { parent: AST.SvelteElement },
      ) {
        if (node.key.name !== "class") {
          return
        }

        for (let index = 0; index < node.value.length; index++) {
          const valueElement = node.value[index]
          if (valueElement.type !== "SvelteMustacheTag") {
            continue
          }
          verify(valueElement, index, node)
        }
      },
    }
  },
})
