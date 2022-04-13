import type { AST } from "svelte-eslint-parser"
import type { RuleContext } from "../../types"
import Parser from "./template-safe-parser"
import type { Root, ChildNode, AnyNode } from "postcss"
import { Input } from "postcss"
import type * as ESTree from "estree"

/** Parse for CSS */
function safeParseCss(css: string): Root | null {
  try {
    const input = new Input(css)

    const parser = new Parser(input)
    parser.parse()

    return parser.root
  } catch {
    return null
  }
}

const cache = new WeakMap<AST.SvelteAttribute, SvelteStyleRoot | null>()

/**
 * Parse style attribute value
 */
export function parseStyleAttributeValue(
  node: AST.SvelteAttribute,
  context: RuleContext,
): SvelteStyleRoot | null {
  if (cache.has(node)) {
    return cache.get(node) || null
  }
  cache.set(node, null)
  const startOffset = node.value[0].range[0]
  const sourceCode = context.getSourceCode()
  const cssCode = node.value.map((value) => sourceCode.getText(value)).join("")
  const root = safeParseCss(cssCode)
  if (!root) {
    return root
  }
  const ctx: Ctx = {
    startOffset,
    value: node.value,
    context,
  }

  const mustacheTags = node.value.filter(
    (v): v is AST.SvelteMustacheTagText => v.type === "SvelteMustacheTag",
  )

  const converted = convertRoot(root, mustacheTags, (e) => e.range, ctx)
  cache.set(node, converted)
  return converted
}

export interface SvelteStyleNode {
  nodes?: SvelteStyleChildNode[]
  range: AST.Range
  loc: AST.SourceLocation
}
interface AbsSvelteStyleRoot<
  E extends AST.SvelteMustacheTagText | ESTree.Expression,
> {
  type: "root"
  nodes: (SvelteStyleChildNode | SvelteStyleInline<E>)[]
}
export type SvelteStyleRoot = AbsSvelteStyleRoot<AST.SvelteMustacheTagText>
export type SvelteStyleInlineRoot = AbsSvelteStyleRoot<ESTree.Expression>
export interface SvelteStyleInline<
  E extends
    | AST.SvelteMustacheTagText
    | ESTree.Expression = AST.SvelteMustacheTagText,
> extends SvelteStyleNode {
  type: "inline"
  node: E
  getInlineStyle(node: ESTree.Expression): SvelteStyleInlineRoot | null
  getAllInlineStyles(): Map<ESTree.Expression, SvelteStyleInlineRoot>
}
export interface SvelteStyleDeclaration extends SvelteStyleNode {
  type: "decl"
  prop: {
    name: string
    range: AST.Range
    loc: AST.SourceLocation
  }
  value: {
    value: string
    range: AST.Range
    loc: AST.SourceLocation
  }
  important: boolean
  unsafe?: boolean
}
export interface SvelteStyleComment extends SvelteStyleNode {
  type: "comment"
  unsafe?: boolean
}

export type SvelteStyleChildNode = SvelteStyleDeclaration | SvelteStyleComment

type Ctx = {
  startOffset: number
  value: AST.SvelteAttribute["value"]
  context: RuleContext
}

/** Checks wether the given node is string literal or not  */
function isStringLiteral(
  node: ESTree.Expression,
): node is ESTree.Literal & { value: string } {
  return node.type === "Literal" && typeof node.value === "string"
}

/** convert root node */
function convertRoot<E extends AST.SvelteMustacheTagText | ESTree.Expression>(
  root: Root,
  interpolations: E[],
  getRange: (e: E) => AST.Range,
  ctx: Ctx,
): AbsSvelteStyleRoot<E> | null {
  const nodes: (SvelteStyleChildNode | SvelteStyleInline<E>)[] = []
  for (const child of root.nodes) {
    const converted = convertChild(child, ctx)
    if (!converted) {
      return null
    }

    while (interpolations[0]) {
      const tagOrExpr = interpolations[0]
      if (tagOrExpr.range![1] <= converted.range[0]) {
        nodes.push(buildSvelteStyleInline(tagOrExpr))
        interpolations.shift()
        continue
      }
      if (tagOrExpr.range![0] < converted.range[1]) {
        if (
          (tagOrExpr.range![0] < converted.range[0] &&
            converted.range[0] < tagOrExpr.range![1]) ||
          (tagOrExpr.range![0] < converted.range[1] &&
            converted.range[1] < tagOrExpr.range![1])
        ) {
          converted.unsafe = true
        }
        interpolations.shift()
        continue
      }
      break
    }

    nodes.push(converted)
  }

  nodes.push(...interpolations.map(buildSvelteStyleInline))

  return {
    type: "root",
    nodes,
  }

  /** Build SvelteStyleInline */
  function buildSvelteStyleInline(tagOrExpr: E): SvelteStyleInline<E> {
    const inlineStyles = new Map<
      ESTree.Expression,
      SvelteStyleInlineRoot | null
    >()
    let range: AST.Range | null = null

    /** Get range */
    function getRangeForInline() {
      if (range) {
        return range
      }
      return range ?? (range = getRange(tagOrExpr))
    }

    return {
      type: "inline",
      node: tagOrExpr,
      get range() {
        return getRangeForInline()
      },
      get loc() {
        return toLoc(getRangeForInline(), ctx)
      },
      getInlineStyle(node) {
        return getInlineStyle(node)
      },
      getAllInlineStyles() {
        const allInlineStyles = new Map<
          ESTree.Expression,
          SvelteStyleInlineRoot
        >()
        for (const node of extractExpressions(tagOrExpr)) {
          const style = getInlineStyle(node)
          if (style) {
            allInlineStyles.set(node, style)
          }
        }
        return allInlineStyles
      },
    }

    /** Get inline style node */
    function getInlineStyle(
      node: AST.SvelteMustacheTagText | ESTree.Expression,
    ): SvelteStyleInlineRoot | null {
      if (node.type === "SvelteMustacheTag") {
        return getInlineStyle(node.expression)
      }
      if (inlineStyles.has(node)) {
        return inlineStyles.get(node) || null
      }
      const sourceCode = ctx.context.getSourceCode()
      inlineStyles.set(node, null)

      let converted: SvelteStyleInlineRoot | null
      if (isStringLiteral(node)) {
        const root = safeParseCss(sourceCode.getText(node).slice(1, -1))
        if (!root) {
          return null
        }
        converted = convertRoot(root, [], () => [0, 0], {
          ...ctx,
          startOffset: node.range![0] + 1,
        })
      } else if (node.type === "TemplateLiteral") {
        const root = safeParseCss(sourceCode.getText(node).slice(1, -1))
        if (!root) {
          return null
        }
        converted = convertRoot(
          root,
          [...node.expressions],
          (e) => {
            const index = node.expressions.indexOf(e)
            return [
              node.quasis[index].range![1] - 2,
              node.quasis[index + 1].range![0] + 1,
            ]
          },
          {
            ...ctx,
            startOffset: node.range![0] + 1,
          },
        )
      } else {
        return null
      }
      inlineStyles.set(node, converted)
      return converted
    }

    /** Extract all expressions */
    function* extractExpressions(
      node: AST.SvelteMustacheTagText | ESTree.Expression,
    ): Iterable<(ESTree.Literal & { value: string }) | ESTree.TemplateLiteral> {
      if (node.type === "SvelteMustacheTag") {
        yield* extractExpressions(node.expression)
      } else if (isStringLiteral(node)) {
        yield node
      } else if (node.type === "TemplateLiteral") {
        yield node
      } else if (node.type === "ConditionalExpression") {
        yield* extractExpressions(node.consequent)
        yield* extractExpressions(node.alternate)
      } else if (node.type === "LogicalExpression") {
        yield* extractExpressions(node.left)
        yield* extractExpressions(node.right)
      }
    }
  }
}

/** convert child node */
function convertChild(node: ChildNode, ctx: Ctx): SvelteStyleChildNode | null {
  const range = convertRange(node, ctx)
  if (node.type === "decl") {
    const propRange: AST.Range = [range[0], range[0] + node.prop.length]
    const declValueStartIndex = propRange[1] + (node.raws.between || "").length
    const valueRange: AST.Range = [
      declValueStartIndex,
      declValueStartIndex + (node.raws.value?.value || node.value).length,
    ]
    return {
      type: "decl",
      prop: {
        name: node.prop,
        range: propRange,
        get loc() {
          return toLoc(propRange, ctx)
        },
      },
      value: {
        value: node.value,
        range: valueRange,
        get loc() {
          return toLoc(valueRange, ctx)
        },
      },
      important: node.important,
      range,
      get loc() {
        return toLoc(range, ctx)
      },
    }
  }
  if (node.type === "comment") {
    return {
      type: "comment",
      range,
      get loc() {
        return toLoc(range, ctx)
      },
    }
  }
  if (node.type === "atrule") {
    // unexpected node
    return null
  }
  if (node.type === "rule") {
    // unexpected node
    return null
  }
  // unknown node
  return null
}

/** convert range */
function convertRange(node: AnyNode, ctx: Ctx): AST.Range {
  return [
    ctx.startOffset + node.source!.start!.offset,
    ctx.startOffset + node.source!.end!.offset + 1,
  ]
}

/** convert range */
function toLoc(range: AST.Range, ctx: Ctx): AST.SourceLocation {
  return {
    start: ctx.context.getSourceCode().getLocFromIndex(range[0]),
    end: ctx.context.getSourceCode().getLocFromIndex(range[1]),
  }
}
