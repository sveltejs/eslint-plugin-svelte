import type { ASTNode, SourceCode } from "../types"
import type * as ESTree from "estree"
import type { AST as SvAST } from "svelte-eslint-parser"

/**
 * Checks whether or not the tokens of two given nodes are same.
 * @param left A node 1 to compare.
 * @param right A node 2 to compare.
 * @param sourceCode The ESLint source code object.
 * @returns  the source code for the given node.
 */
export function equalTokens(
  left: ASTNode,
  right: ASTNode,
  sourceCode: SourceCode,
): boolean {
  const tokensL = sourceCode.getTokens(left)
  const tokensR = sourceCode.getTokens(right)

  if (tokensL.length !== tokensR.length) {
    return false
  }
  for (let i = 0; i < tokensL.length; ++i) {
    if (
      tokensL[i].type !== tokensR[i].type ||
      tokensL[i].value !== tokensR[i].value
    ) {
      return false
    }
  }

  return true
}

/**
 * Get the value of a given node if it's a literal or a template literal.
 */
export function getStringIfConstant(node: ESTree.Expression): string | null {
  if (node.type === "Literal") {
    if (typeof node.value === "string") return node.value
  } else if (node.type === "TemplateLiteral") {
    let str = ""
    const quasis = [...node.quasis]
    const expressions = [...node.expressions]
    let quasi: ESTree.TemplateElement | undefined,
      expr: ESTree.Expression | undefined
    while ((quasi = quasis.shift())) {
      str += quasi.value.cooked!
      expr = expressions.shift()
      if (expr) {
        const exprStr = getStringIfConstant(expr)
        if (exprStr == null) {
          return null
        }
        str += exprStr
      }
    }
    return str
  } else if (node.type === "BinaryExpression") {
    if (node.operator === "+") {
      const left = getStringIfConstant(node.left)
      if (left == null) {
        return null
      }
      const right = getStringIfConstant(node.right)
      if (right == null) {
        return null
      }
      return left + right
    }
  }
  return null
}

/**
 * Check if it need parentheses.
 */
export function needParentheses(
  node: ESTree.Expression,
  kind: "not" | "logical",
): boolean {
  if (
    node.type === "ArrowFunctionExpression" ||
    node.type === "AssignmentExpression" ||
    node.type === "BinaryExpression" ||
    node.type === "ConditionalExpression" ||
    node.type === "LogicalExpression" ||
    node.type === "SequenceExpression" ||
    node.type === "UnaryExpression" ||
    node.type === "UpdateExpression"
  )
    return true
  if (kind === "logical") {
    return node.type === "FunctionExpression"
  }
  return false
}

/**
 * Find the attribute from the given element node
 */
export function findAttribute<N extends string>(
  node:
    | SvAST.SvelteElement
    | SvAST.SvelteScriptElement
    | SvAST.SvelteStyleElement
    | SvAST.SvelteStartTag,
  name: N,
):
  | (SvAST.SvelteAttribute & {
      key: SvAST.SvelteAttribute["key"] & { name: N }
    })
  | null {
  const startTag = node.type === "SvelteStartTag" ? node : node.startTag
  for (const attr of startTag.attributes) {
    if (attr.type === "SvelteAttribute") {
      if (attr.key.name === name) {
        return attr as never
      }
    }
  }
  return null
}
/**
 * Find the shorthand attribute from the given element node
 */
export function findShorthandAttribute<N extends string>(
  node:
    | SvAST.SvelteElement
    | SvAST.SvelteScriptElement
    | SvAST.SvelteStyleElement
    | SvAST.SvelteStartTag,
  name: N,
):
  | (SvAST.SvelteShorthandAttribute & {
      key: SvAST.SvelteShorthandAttribute["key"] & { name: N }
    })
  | null {
  const startTag = node.type === "SvelteStartTag" ? node : node.startTag
  for (const attr of startTag.attributes) {
    if (attr.type === "SvelteShorthandAttribute") {
      if (attr.key.name === name) {
        return attr as never
      }
    }
  }
  return null
}

/**
 * Find the bind directive from the given element node
 */
export function findBindDirective<N extends string>(
  node:
    | SvAST.SvelteElement
    | SvAST.SvelteScriptElement
    | SvAST.SvelteStyleElement
    | SvAST.SvelteStartTag,
  name: N,
):
  | (SvAST.SvelteBindingDirective & {
      key: SvAST.SvelteDirectiveKey & {
        name: SvAST.SvelteDirectiveKey["name"] & { name: N }
      }
    })
  | null {
  const startTag = node.type === "SvelteStartTag" ? node : node.startTag
  for (const attr of startTag.attributes) {
    if (attr.type === "SvelteDirective") {
      if (attr.kind === "Binding" && attr.key.name.name === name) {
        return attr as never
      }
    }
  }
  return null
}

/**
 * Get the static attribute value from given attribute
 */
export function getStaticAttributeValue(
  node: SvAST.SvelteAttribute,
): string | null {
  let str = ""
  for (const value of node.value) {
    if (value.type === "SvelteLiteral") {
      str += value.value
    } else {
      return null
    }
  }
  return str
}
