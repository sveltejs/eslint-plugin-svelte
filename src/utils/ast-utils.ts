import type { ASTNode, RuleContext, SourceCode } from "../types"
import type * as ESTree from "estree"
import type { AST as SvAST } from "svelte-eslint-parser"
import * as eslintUtils from "eslint-utils"
import type { Scope } from "eslint"
import voidElements from "./void-elements"

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

/** Checks whether the given node is the html element node or <svelte:element> node. */
export function isHTMLElementLike(
  node:
    | SvAST.SvelteElement
    | SvAST.SvelteScriptElement
    | SvAST.SvelteStyleElement,
): node is
  | SvAST.SvelteHTMLElement
  | (SvAST.SvelteSpecialElement & {
      name: SvAST.SvelteName & { name: "svelte:element" }
    }) {
  if (node.type !== "SvelteElement") {
    return false
  }

  switch (node.kind) {
    case "html":
      return true
    case "special":
      return node.name.name === "svelte:element"
    default:
      return false
  }
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
/**
 * Get the static attribute value from given attribute
 */
export function getLangValue(
  node: SvAST.SvelteScriptElement | SvAST.SvelteStyleElement,
): string | null {
  const langAttr = findAttribute(node, "lang")
  return langAttr && getStaticAttributeValue(langAttr)
}

/**
 * Find the variable of a given name.
 */
export function findVariable(
  context: RuleContext,
  node: ESTree.Identifier,
): Scope.Variable | null {
  return eslintUtils.findVariable(getScope(context, node), node)
}

/**
 * Gets the scope for the current node
 */
export function getScope(
  context: RuleContext,
  currentNode: ESTree.Node,
): Scope.Scope {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  const scopeManager = (context.getSourceCode() as any).scopeManager

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  let node: any = currentNode
  for (; node; node = node.parent || null) {
    const scope = scopeManager.acquire(node, false)

    if (scope) {
      if (scope.type === "function-expression-name") {
        return scope.childScopes[0]
      }
      return scope
    }
  }

  return scopeManager.scopes[0]
}

export type QuoteAndRange = {
  quote: "unquoted" | "double" | "single"
  range: [number, number]
  firstToken: SvAST.Token | SvAST.Comment
  lastToken: SvAST.Token | SvAST.Comment
}
/** Get the quote and range from given attribute values */
export function getAttributeValueQuoteAndRange(
  attr:
    | SvAST.SvelteAttribute
    | SvAST.SvelteDirective
    | SvAST.SvelteStyleDirective
    | SvAST.SvelteSpecialDirective,
  sourceCode: SourceCode,
): QuoteAndRange | null {
  const valueTokens = getAttributeValueRangeTokens(attr, sourceCode)
  if (valueTokens == null) {
    return null
  }
  const { firstToken: valueFirstToken, lastToken: valueLastToken } = valueTokens
  const eqToken = sourceCode.getTokenAfter(attr.key)
  if (
    !eqToken ||
    eqToken.value !== "=" ||
    valueFirstToken.range[0] < eqToken.range[1]
  ) {
    // invalid
    return null
  }
  const beforeTokens = sourceCode.getTokensBetween(eqToken, valueFirstToken)
  if (beforeTokens.length === 0) {
    return {
      quote: "unquoted",
      range: [valueFirstToken.range[0], valueLastToken.range[1]],
      firstToken: valueFirstToken,
      lastToken: valueLastToken,
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
    firstToken: beforeToken,
    lastToken: afterToken,
  }
}
export function getMustacheTokens(
  node:
    | SvAST.SvelteMustacheTag
    | SvAST.SvelteShorthandAttribute
    | SvAST.SvelteSpreadAttribute
    | SvAST.SvelteDebugTag,
  sourceCode: SourceCode,
): {
  openToken: SvAST.Token
  closeToken: SvAST.Token
}
export function getMustacheTokens(
  node:
    | SvAST.SvelteDirective
    | SvAST.SvelteSpecialDirective
    | SvAST.SvelteMustacheTag
    | SvAST.SvelteShorthandAttribute
    | SvAST.SvelteSpreadAttribute
    | SvAST.SvelteDebugTag,
  sourceCode: SourceCode,
): {
  openToken: SvAST.Token
  closeToken: SvAST.Token
} | null
/** Get the mustache tokens from given node */
export function getMustacheTokens(
  node:
    | SvAST.SvelteDirective
    | SvAST.SvelteSpecialDirective
    | SvAST.SvelteMustacheTag
    | SvAST.SvelteShorthandAttribute
    | SvAST.SvelteSpreadAttribute
    | SvAST.SvelteDebugTag,
  sourceCode: SourceCode,
): {
  openToken: SvAST.Token
  closeToken: SvAST.Token
} | null {
  if (
    node.type === "SvelteMustacheTag" ||
    node.type === "SvelteShorthandAttribute" ||
    node.type === "SvelteSpreadAttribute" ||
    node.type === "SvelteDebugTag"
  ) {
    const openToken = sourceCode.getFirstToken(node)
    const closeToken = sourceCode.getLastToken(node)
    return {
      openToken,
      closeToken,
    }
  }
  if (node.expression == null) {
    return null
  }
  if (
    node.key.range[0] <= node.expression.range![0] &&
    node.expression.range![1] <= node.key.range[1]
  ) {
    // shorthand
    return null
  }
  let openToken = sourceCode.getTokenBefore(node.expression)
  let closeToken = sourceCode.getTokenAfter(node.expression)
  while (
    openToken &&
    closeToken &&
    eslintUtils.isOpeningParenToken(openToken) &&
    eslintUtils.isClosingParenToken(closeToken)
  ) {
    openToken = sourceCode.getTokenBefore(openToken)
    closeToken = sourceCode.getTokenAfter(closeToken)
  }
  if (
    !openToken ||
    !closeToken ||
    eslintUtils.isNotOpeningBraceToken(openToken) ||
    eslintUtils.isNotClosingBraceToken(closeToken)
  ) {
    return null
  }
  return {
    openToken,
    closeToken,
  }
}

/** Get attribute key text */
export function getAttributeKeyText(
  node:
    | SvAST.SvelteAttribute
    | SvAST.SvelteShorthandAttribute
    | SvAST.SvelteStyleDirective
    | SvAST.SvelteDirective
    | SvAST.SvelteSpecialDirective,
): string {
  switch (node.type) {
    case "SvelteAttribute":
    case "SvelteShorthandAttribute":
      return node.key.name
    case "SvelteStyleDirective":
      return `style:${node.key.name.name}`
    case "SvelteSpecialDirective":
      return node.kind
    case "SvelteDirective": {
      const dir = getDirectiveName(node)
      return `${dir}:${node.key.name.name}${
        node.key.modifiers.length ? `|${node.key.modifiers.join("|")}` : ""
      }`
    }
    default:
      throw new Error(
        `Unknown node type: ${
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- error
          (node as any).type
        }`,
      )
  }
}

/** Get directive name */
export function getDirectiveName(node: SvAST.SvelteDirective): string {
  switch (node.kind) {
    case "Action":
      return "use"
    case "Animation":
      return "animate"
    case "Binding":
      return "bind"
    case "Class":
      return "class"
    case "EventHandler":
      return "on"
    case "Let":
      return "let"
    case "Transition":
      return node.intro && node.outro ? "transition" : node.intro ? "in" : "out"
    case "Ref":
      return "ref"
    default:
      throw new Error("Unknown directive kind")
  }
}

/** Get the value tokens from given attribute */
function getAttributeValueRangeTokens(
  attr:
    | SvAST.SvelteAttribute
    | SvAST.SvelteDirective
    | SvAST.SvelteStyleDirective
    | SvAST.SvelteSpecialDirective,
  sourceCode: SourceCode,
) {
  if (attr.type === "SvelteAttribute" || attr.type === "SvelteStyleDirective") {
    if (!attr.value.length) {
      return null
    }
    const first = attr.value[0]
    const last = attr.value[attr.value.length - 1]
    return {
      firstToken: sourceCode.getFirstToken(first),
      lastToken: sourceCode.getLastToken(last),
    }
  }
  const tokens = getMustacheTokens(attr, sourceCode)
  if (!tokens) {
    return null
  }
  return {
    firstToken: tokens.openToken,
    lastToken: tokens.closeToken,
  }
}

/**
 * Returns name of SvelteElement
 */
export function getNodeName(node: SvAST.SvelteElement): string {
  if ("name" in node.name) {
    return node.name.name
  }
  let object = ""
  let currentObject = node.name.object
  while ("object" in currentObject) {
    object = `${currentObject.property.name}.${object}`
    currentObject = currentObject.object
  }
  if ("name" in currentObject) {
    object = `${currentObject.name}.${object}`
  }
  return object + node.name.property.name
}

/**
 * Returns true if element is known void element
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Empty_element}
 */
export function isVoidHtmlElement(node: SvAST.SvelteElement): boolean {
  return voidElements.includes(getNodeName(node))
}
