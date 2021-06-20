import type { ASTNode, SourceCode } from "../../types"
import type { AST } from "svelte-eslint-parser"
import { isOpeningParenToken, isClosingParenToken } from "eslint-utils"
import { isNotWhitespace, isWhitespace } from "./ast"

type AnyToken = AST.Token | AST.Comment

export type IndentOptions = {
  indentChar: " " | "\t"
  indentSize: number
  switchCase: number
  ignoredNodes: string[]
}
export type IndentContext = {
  sourceCode: SourceCode
  options: IndentOptions
  /**
   * Set offset to the given tokens.
   */
  setOffset: (
    token: AnyToken | null | undefined | (AnyToken | null | undefined)[],
    offset: number,
    baseToken: AnyToken,
  ) => void
  /**
   * Copy offset to the given tokens from srcToken.
   */
  copyOffset: (
    token: AnyToken | null | undefined | (AnyToken | null | undefined)[],
    srcToken: AnyToken,
  ) => void

  /**
   * Set baseline offset to the given token.
   */
  setOffsetBaseLine: (
    token: AnyToken | null | undefined | (AnyToken | null | undefined)[],
    offset: number,
  ) => void
  /**
   * Ignore all tokens of the given node.
   */
  ignore: (node: ASTNode) => void
}

/**
 * Set offset to the given nodes.
 * The first node is offsetted from the given base token.
 */
export function setOffsetNodes(
  { sourceCode, setOffset }: IndentContext,
  nodes: (ASTNode | AnyToken | null | undefined)[],
  baseNodeOrToken: ASTNode | AnyToken,
  lastNodeOrToken: ASTNode | AnyToken | null,
  offset: number,
): void {
  const baseToken = sourceCode.getFirstToken(baseNodeOrToken)

  let prevToken = sourceCode.getLastToken(baseNodeOrToken)
  for (const node of nodes) {
    if (node == null) {
      continue
    }
    const elementTokens = getFirstAndLastTokens(
      sourceCode,
      node,
      prevToken.range[1],
    )

    let t: AnyToken | null = prevToken
    while (
      (t = sourceCode.getTokenAfter(t, {
        includeComments: true,
        filter: isNotWhitespace,
      })) != null &&
      t.range[1] <= elementTokens.firstToken.range[0]
    ) {
      setOffset(t, offset, baseToken)
    }
    setOffset(elementTokens.firstToken, offset, baseToken)

    prevToken = elementTokens.lastToken
  }

  if (lastNodeOrToken) {
    const lastToken = sourceCode.getFirstToken(lastNodeOrToken)
    let t: AnyToken | null = prevToken
    while (
      (t = sourceCode.getTokenAfter(t, {
        includeComments: true,
        filter: isNotWhitespace,
      })) != null &&
      t.range[1] <= lastToken.range[0]
    ) {
      setOffset(t, offset, baseToken)
    }
    setOffset(lastToken, 0, baseToken)
  }
}

/**
 * Get the first and last tokens of the given node.
 * If the node is parenthesized, this gets the outermost parentheses.
 * If the node have whitespace at the start and the end, they will be skipped.
 */
export function getFirstAndLastTokens(
  sourceCode: SourceCode,
  node: ASTNode | AnyToken,
  borderOffset = 0,
): { firstToken: AST.Token; lastToken: AST.Token } {
  let firstToken = sourceCode.getFirstToken(node)
  let lastToken = sourceCode.getLastToken(node)

  // Get the outermost left parenthesis if it's parenthesized.
  let left: AST.Token | null, right: AST.Token | null
  while (
    (left = sourceCode.getTokenBefore(firstToken)) != null &&
    (right = sourceCode.getTokenAfter(lastToken)) != null &&
    isOpeningParenToken(left) &&
    isClosingParenToken(right) &&
    borderOffset <= left.range[0]
  ) {
    firstToken = left
    lastToken = right
  }

  while (isWhitespace(firstToken) && firstToken.range[0] < lastToken.range[0]) {
    firstToken = sourceCode.getTokenAfter(firstToken) as AST.Token
  }
  while (isWhitespace(lastToken) && firstToken.range[0] < lastToken.range[0]) {
    lastToken = sourceCode.getTokenBefore(lastToken) as AST.Token
  }

  return { firstToken, lastToken }
}
