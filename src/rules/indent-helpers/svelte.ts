import type { AST } from "svelte-eslint-parser"
import type { ASTNode } from "../../types"
import { isNotWhitespace } from "./ast"
import type { IndentContext } from "./commons"
import { getFirstAndLastTokens } from "./commons"
import { setOffsetNodes } from "./commons"
type NodeWithParent = Exclude<
  AST.SvelteNode,
  AST.SvelteProgram | AST.SvelteReactiveStatement
>
type NodeListenerMap<T extends NodeWithParent = NodeWithParent> = {
  [key in NodeWithParent["type"]]: T extends { type: key } ? T : never
}

type NodeListener = {
  [T in keyof NodeListenerMap]: (node: NodeListenerMap[T]) => void
}
const PREFORMATTED_ELEMENT_NAMES = ["pre", "textarea"]

/**
 * Creates AST event handlers for svelte nodes.
 *
 * @param context The rule context.
 * @returns AST event handlers.
 */
export function defineVisitor(context: IndentContext): NodeListener {
  const { setOffset, sourceCode, copyOffset, ignore } = context
  const visitor = {
    // ----------------------------------------------------------------------
    // ELEMENTS
    // ----------------------------------------------------------------------
    SvelteScriptElement(node: AST.SvelteScriptElement) {
      setOffsetNodes(context, node.body, node.startTag, node.endTag, 1)
    },
    SvelteStyleElement(node: AST.SvelteStyleElement) {
      node.children.forEach(ignore)
    },
    SvelteElement(node: AST.SvelteElement) {
      if (
        (node.name.type !== "Identifier" && node.name.type !== "SvelteName") ||
        !PREFORMATTED_ELEMENT_NAMES.includes(node.name.name)
      ) {
        if (node.endTag) {
          setOffsetNodes(
            context,
            node.children.filter(isNotEmptyTextNode),
            node.startTag,
            node.endTag,
            1,
          )
        }
      } else {
        const startTagToken = sourceCode.getFirstToken(node)
        const endTagToken = node.endTag && sourceCode.getFirstToken(node.endTag)
        setOffset(endTagToken, 0, startTagToken)
        node.children.forEach(ignore)
      }
    },
    // ----------------------------------------------------------------------
    // TAGS
    // ----------------------------------------------------------------------
    SvelteStartTag(node: AST.SvelteStartTag) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)

      setOffsetNodes(context, node.attributes, openToken, closeToken, 1)
      if (node.selfClosing) {
        const slash = sourceCode.getTokenBefore(closeToken)!
        if (slash.value === "/") {
          setOffset(slash, 0, openToken)
        }
      }
    },
    SvelteEndTag(node: AST.SvelteEndTag) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)
      setOffsetNodes(context, [], openToken, closeToken, 1)
    },
    // ----------------------------------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------------------------------
    // eslint-disable-next-line complexity -- X(
    SvelteAttribute(
      node:
        | AST.SvelteAttribute
        | AST.SvelteDirective
        | AST.SvelteSpecialDirective,
    ) {
      const keyToken = sourceCode.getFirstToken(node)
      const eqToken = sourceCode.getTokenAfter(node.key)

      if (eqToken != null && eqToken.range[1] <= node.range[1]) {
        setOffset(eqToken, 1, keyToken)

        const valueStartToken = sourceCode.getTokenAfter(eqToken)
        if (
          valueStartToken != null &&
          valueStartToken.range[1] <= node.range[1]
        ) {
          setOffset(valueStartToken, 1, keyToken)

          const values = node.type === "SvelteAttribute" ? node.value : []
          // process quoted
          let processedValues = false
          if (valueStartToken.type === "Punctuator") {
            const quoted = ['"', "'"].includes(valueStartToken.value)
            const mustache = !quoted && valueStartToken.value === "{"
            if (quoted || mustache) {
              const last = sourceCode.getLastToken(node)
              if (
                last.type === "Punctuator" &&
                ((quoted && last.value === valueStartToken.value) ||
                  (mustache && last.value === "}"))
              ) {
                setOffset(last, 0, valueStartToken)

                setOffsetNodes(context, values, valueStartToken, last, 1)
                processedValues = true
              }
            }
          }
          if (!processedValues) {
            for (const val of values) {
              const token = sourceCode.getFirstToken(val)
              setOffset(token, 0, valueStartToken)
            }
          }
        }
      }
    },
    SvelteDirective(node: AST.SvelteDirective) {
      visitor.SvelteAttribute(node)
    },
    SvelteSpecialDirective(node: AST.SvelteSpecialDirective) {
      visitor.SvelteAttribute(node)
    },
    SvelteShorthandAttribute(
      node: AST.SvelteShorthandAttribute | AST.SvelteSpreadAttribute,
    ) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)
      setOffsetNodes(context, [], openToken, closeToken, 1)
    },
    SvelteSpreadAttribute(node: AST.SvelteSpreadAttribute) {
      visitor.SvelteShorthandAttribute(node)
    },
    // ----------------------------------------------------------------------
    // ATTRIBUTE KEYS
    // ----------------------------------------------------------------------
    SvelteDirectiveKey(_node: AST.SvelteDirectiveKey) {
      // noop
    },
    SvelteSpecialDirectiveKey(_node: AST.SvelteSpecialDirectiveKey) {
      // noop
    },
    // ----------------------------------------------------------------------
    // CONTENTS
    // ----------------------------------------------------------------------
    SvelteText(node: AST.SvelteText) {
      const tokens = sourceCode.getTokens(node, {
        filter: isNotWhitespace,
        includeComments: false,
      })
      const first = tokens.shift()!
      copyOffset(tokens, first)
    },
    SvelteLiteral(node: AST.SvelteLiteral) {
      const tokens = sourceCode.getTokens(node, {
        filter: isNotWhitespace,
        includeComments: false,
      })
      const first = tokens.shift()!
      copyOffset(tokens, first)
    },
    // ----------------------------------------------------------------------
    // MUSTACHE TAGS
    // ----------------------------------------------------------------------
    SvelteMustacheTag(node: AST.SvelteMustacheTag) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)
      setOffsetNodes(context, [node.expression], openToken, closeToken, 1)
    },
    SvelteDebugTag(node: AST.SvelteDebugTag) {
      const openToken = sourceCode.getFirstToken(node)
      const closeToken = sourceCode.getLastToken(node)
      setOffsetNodes(context, node.identifiers, openToken, closeToken, 1)
    },
    // ----------------------------------------------------------------------
    // BLOCKS
    // ----------------------------------------------------------------------
    SvelteIfBlock(node: AST.SvelteIfBlock) {
      const [openToken, ...ifTokens] = sourceCode.getFirstTokens(node, {
        count: node.elseif ? 3 : 2,
        includeComments: false,
      })
      setOffset(ifTokens, 1, openToken)
      const exp = getFirstAndLastTokens(sourceCode, node.expression)
      setOffset(exp.firstToken, 1, ifTokens[0])

      const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken)
      setOffset(closeOpenTagToken, 0, openToken)

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }

      if (node.else) {
        setOffset(sourceCode.getFirstToken(node.else), 0, openToken)
        if (
          node.else.children.length === 1 &&
          node.else.children[0].type === "SvelteIfBlock" &&
          node.else.children[0].elseif
        ) {
          // else if
          return
        }
      }
      const [openCloseTagToken, endIfToken, closeCloseTagToken] =
        sourceCode.getLastTokens(node, {
          count: 3,
          includeComments: false,
        })
      setOffset(openCloseTagToken, 0, openToken)
      setOffset(endIfToken, 1, openCloseTagToken)
      setOffset(closeCloseTagToken, 0, openCloseTagToken)
    },
    SvelteElseBlock(node: AST.SvelteElseBlock) {
      if (
        node.children.length === 1 &&
        node.children[0].type === "SvelteIfBlock" &&
        node.children[0].elseif
      ) {
        return
      }
      const [openToken, elseToken, closeToken] = sourceCode.getFirstTokens(
        node,
        {
          count: 3,
          includeComments: false,
        },
      )
      setOffset(elseToken, 1, openToken)
      setOffset(closeToken, 0, openToken)

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }
    },
    SvelteEachBlock(node: AST.SvelteEachBlock) {
      const [openToken, eachToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      setOffset(eachToken, 1, openToken)
      setOffsetNodes(
        context,
        [node.expression, node.context, node.index],
        eachToken,
        null,
        1,
      )
      if (node.key) {
        const key = getFirstAndLastTokens(sourceCode, node.key)
        setOffset(key.firstToken, 1, eachToken)
        const closeOpenTagToken = sourceCode.getTokenAfter(key.lastToken)
        setOffset(closeOpenTagToken, 0, openToken)
      } else {
        const closeOpenTagToken = sourceCode.getTokenAfter(
          node.index || node.context,
        )
        setOffset(closeOpenTagToken, 0, openToken)
      }

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }
      if (node.else) {
        setOffset(sourceCode.getFirstToken(node.else), 0, openToken)
      }

      const [openCloseTagToken, endEachToken, closeCloseTagToken] =
        sourceCode.getLastTokens(node, {
          count: 3,
          includeComments: false,
        })
      setOffset(openCloseTagToken, 0, openToken)
      setOffset(endEachToken, 1, openCloseTagToken)
      setOffset(closeCloseTagToken, 0, openCloseTagToken)
    },
    SvelteAwaitBlock(node: AST.SvelteAwaitBlock) {
      const [openToken, awaitToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      setOffset(awaitToken, 1, openToken)
      const exp = getFirstAndLastTokens(sourceCode, node.expression)
      setOffset(exp.firstToken, 1, awaitToken)

      if (node.pending) {
        const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken)
        setOffset(closeOpenTagToken, 0, openToken)

        setOffset(
          sourceCode.getFirstToken(node.pending, {
            includeComments: false,
            filter: isNotWhitespace,
          }),
          1,
          openToken,
        )
      }

      if (node.then) {
        if (!node.pending) {
          // {#await expression then value}
          const thenToken = sourceCode.getTokenAfter(exp.lastToken)!
          setOffset(thenToken, 1, openToken)
          if (node.then.value) {
            setOffset(sourceCode.getFirstToken(node.then.value), 1, thenToken)
          }
          const closeOpenTagToken = sourceCode.getTokenAfter(
            node.then.value || thenToken,
          )
          setOffset(closeOpenTagToken, 0, openToken)
        } else {
          // {:then value}
          setOffset(sourceCode.getFirstToken(node.then), 0, openToken)
        }
      }
      if (node.catch) {
        if (!node.pending && !node.then) {
          // {#await expression catch error}
          const catchToken = sourceCode.getTokenAfter(exp.lastToken)!
          setOffset(catchToken, 1, openToken)
          if (node.catch.error) {
            setOffset(sourceCode.getFirstToken(node.catch.error), 1, catchToken)
          }
          const closeOpenTagToken = sourceCode.getTokenAfter(
            node.catch.error || catchToken,
          )
          setOffset(closeOpenTagToken, 0, openToken)
        } else {
          // {:catch value}
          setOffset(sourceCode.getFirstToken(node.catch), 0, openToken)
        }
      }

      const [openCloseTagToken, endAwaitToken, closeCloseTagToken] =
        sourceCode.getLastTokens(node, {
          count: 3,
          includeComments: false,
        })
      setOffset(openCloseTagToken, 0, openToken)
      setOffset(endAwaitToken, 1, openCloseTagToken)
      setOffset(closeCloseTagToken, 0, openCloseTagToken)
    },
    SvelteAwaitPendingBlock(node: AST.SvelteAwaitPendingBlock) {
      const first = sourceCode.getFirstToken(node, {
        includeComments: false,
        filter: isNotWhitespace,
      })!
      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        copyOffset(token, first)
      }
    },
    SvelteAwaitThenBlock(node: AST.SvelteAwaitThenBlock) {
      const parent = node.parent
      if (parent.pending) {
        // {:then value}
        const [openToken, thenToken] = sourceCode.getFirstTokens(node, {
          count: 2,
          includeComments: false,
        })
        setOffset(thenToken, 1, openToken)
        if (node.value) {
          const valueToken = sourceCode.getFirstToken(node.value)
          setOffset(valueToken, 1, thenToken)
        }
        const closeOpenTagToken = sourceCode.getTokenAfter(
          node.value || thenToken,
        )
        setOffset(closeOpenTagToken, 0, openToken)
      }
      const openToken = sourceCode.getFirstToken(node)

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }
    },
    SvelteAwaitCatchBlock(node: AST.SvelteAwaitCatchBlock) {
      const parent = node.parent
      if (parent.pending || parent.then) {
        // {:catch error}
        const [openToken, catchToken] = sourceCode.getFirstTokens(node, {
          count: 2,
          includeComments: false,
        })
        setOffset(catchToken, 1, openToken)
        if (node.error) {
          const errorToken = sourceCode.getFirstToken(node.error)
          setOffset(errorToken, 1, catchToken)
        }
        const closeOpenTagToken = sourceCode.getTokenAfter(
          node.error || catchToken,
        )
        setOffset(closeOpenTagToken, 0, openToken)
      }
      const openToken = sourceCode.getFirstToken(node)

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }
    },
    SvelteKeyBlock(node: AST.SvelteKeyBlock) {
      const [openToken, keyToken] = sourceCode.getFirstTokens(node, {
        count: 2,
        includeComments: false,
      })
      setOffset(keyToken, 1, openToken)
      const exp = getFirstAndLastTokens(sourceCode, node.expression)
      setOffset(exp.firstToken, 1, keyToken)

      const closeOpenTagToken = sourceCode.getTokenAfter(exp.lastToken)
      setOffset(closeOpenTagToken, 0, openToken)

      for (const child of node.children) {
        const token = sourceCode.getFirstToken(child, {
          includeComments: false,
          filter: isNotWhitespace,
        })
        setOffset(token, 1, openToken)
      }

      const [openCloseTagToken, endAwaitToken, closeCloseTagToken] =
        sourceCode.getLastTokens(node, {
          count: 3,
          includeComments: false,
        })
      setOffset(openCloseTagToken, 0, openToken)
      setOffset(endAwaitToken, 1, openCloseTagToken)
      setOffset(closeCloseTagToken, 0, openCloseTagToken)
    },
    // ----------------------------------------------------------------------
    // COMMENTS
    // ----------------------------------------------------------------------
    SvelteHTMLComment(_node: AST.SvelteHTMLComment) {
      // noop
    },
    // ----------------------------------------------------------------------
    // NAMES
    // ----------------------------------------------------------------------
    SvelteName(_node: AST.SvelteName) {
      // noop
    },
    SvelteMemberExpressionName(_node: AST.SvelteMemberExpressionName) {
      // noop
    },
  }

  return visitor
}

/**
 * Check whether the given node is not an empty text node.
 * @param node The node to check.
 * @returns `false` if the token is empty text node.
 */
function isNotEmptyTextNode(node: ASTNode) {
  return !(node.type === "SvelteText" && node.value.trim() === "")
}
