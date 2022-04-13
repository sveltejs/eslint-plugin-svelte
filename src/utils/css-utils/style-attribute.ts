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

  const converted = convertRoot(root, mustacheTags, ctx)
  cache.set(node, converted)
  return converted
}

export interface SvelteStyleNode {
  nodes?: SvelteStyleChildNode[]
  range: AST.Range
  loc: AST.SourceLocation
}
export interface SvelteStyleRoot {
  type: "root"
  nodes: (SvelteStyleChildNode | SvelteStyleInline)[]
}
export interface SvelteStyleInline extends SvelteStyleNode {
  type: "inline"
  node: AST.SvelteMustacheTagText
  getInlineStyle(node: ESTree.Expression): SvelteStyleRoot | null
  getAllInlineStyles(): Map<ESTree.Expression, SvelteStyleRoot>
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
function convertRoot(
  root: Root,
  mustacheTags: AST.SvelteMustacheTagText[],
  ctx: Ctx,
): SvelteStyleRoot | null {
  const nodes: (SvelteStyleChildNode | SvelteStyleInline)[] = []
  for (const child of root.nodes) {
    const converted = convertChild(child, ctx)
    if (!converted) {
      return null
    }

    while (mustacheTags[0]) {
      const tag = mustacheTags[0]
      if (tag.range[1] <= converted.range[0]) {
        nodes.push(buildSvelteStyleInline(tag))
        mustacheTags.shift()
        continue
      }
      if (tag.range[0] < converted.range[1]) {
        if (
          (tag.range[0] < converted.range[0] &&
            converted.range[0] < tag.range[1]) ||
          (tag.range[0] < converted.range[1] &&
            converted.range[1] < tag.range[1])
        ) {
          converted.unsafe = true
        }
        mustacheTags.shift()
        continue
      }
      break
    }

    nodes.push(converted)
  }

  nodes.push(...mustacheTags.map(buildSvelteStyleInline))

  return {
    type: "root",
    nodes,
  }

  /** Build SvelteStyleInline */
  function buildSvelteStyleInline(
    tag: AST.SvelteMustacheTagText,
  ): SvelteStyleInline {
    const inlineStyles = new Map<ESTree.Expression, SvelteStyleRoot | null>()
    return {
      type: "inline",
      node: tag,
      range: tag.range,
      loc: tag.loc,
      getInlineStyle(node) {
        return getInlineStyle(node)
      },
      getAllInlineStyles() {
        const allInlineStyles = new Map<ESTree.Expression, SvelteStyleRoot>()
        for (const node of extractExpressions(tag.expression)) {
          const style = getInlineStyle(node)
          if (style) {
            allInlineStyles.set(node, style)
          }
        }
        return allInlineStyles
      },
    }

    /** Get inline style node */
    function getInlineStyle(node: ESTree.Expression) {
      if (inlineStyles.has(node)) {
        return inlineStyles.get(node) || null
      }
      inlineStyles.set(node, null)
      const {
        root,
        startOffset = 0,
      }: { root?: Root | null; startOffset?: number } = isStringLiteral(node)
        ? { root: safeParseCss(node.value), startOffset: node.range![0] + 1 }
        : node.type === "TemplateLiteral" && node.expressions.length === 0
        ? {
            root: safeParseCss(
              node.quasis[0].value.cooked ?? node.quasis[0].value.raw,
            ),
            startOffset: node.quasis[0].range![0] + 1,
          }
        : {}
      if (!root) {
        return null
      }
      const converted = convertRoot(root, [], { ...ctx, startOffset })
      inlineStyles.set(node, converted)
      return converted
    }

    /** Extract all expressions */
    function* extractExpressions(
      node: ESTree.Expression,
    ): Iterable<(ESTree.Literal & { value: string }) | ESTree.TemplateLiteral> {
      if (isStringLiteral(node)) {
        yield node
      }
      if (node.type === "TemplateLiteral") {
        if (node.expressions.length === 0) {
          yield node
        }
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
