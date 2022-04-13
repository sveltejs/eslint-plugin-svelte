import type { AST } from "svelte-eslint-parser"
import type { RuleContext } from "../../types"
import Parser from "./template-safe-parser"
import type { Root, ChildNode, AnyNode } from "postcss"
import { Input } from "postcss"

/** Parse for CSS */
export function safeParseCss(css: string): Root | null {
  try {
    const input = new Input(css)

    const parser = new Parser(input)
    parser.parse()

    return parser.root
  } catch {
    return null
  }
}

/**
 * Parse style attribute value
 */
export function parseStyleAttributeValue(
  node: AST.SvelteAttribute,
  context: RuleContext,
): SvelteStyleRoot | null {
  const valueStartIndex = node.value[0].range[0]
  const sourceCode = context.getSourceCode()
  const cssCode = node.value.map((value) => sourceCode.getText(value)).join("")
  const root = safeParseCss(cssCode)
  if (!root) {
    return root
  }
  const ctx: Ctx = {
    valueStartIndex,
    value: node.value,
    context,
  }

  const nodes = root.nodes.map((n) => convertChild(n, ctx))
  return {
    type: "root",
    nodes,
    walk(cb) {
      const targets = [...nodes]
      let target
      while ((target = targets.shift())) {
        cb(target)
        if (target.nodes) {
          targets.push(...target.nodes)
        }
      }
    },
  }
}

export interface SvelteStyleNode {
  range: AST.Range
  nodes?: SvelteStyleChildNode[]
}
export interface SvelteStyleRoot {
  type: "root"
  nodes: SvelteStyleChildNode[]
  walk(cb: (node: SvelteStyleChildNode) => void): void
}
export interface SvelteStyleAtRule extends SvelteStyleNode {
  type: "atrule"
  nodes: SvelteStyleChildNode[]
}
export interface SvelteStyleRule extends SvelteStyleNode {
  type: "rule"
  nodes: SvelteStyleChildNode[]
}
export interface SvelteStyleDeclaration extends SvelteStyleNode {
  type: "decl"
  prop: string
  value: string
  important: boolean
  valueRange: AST.Range
}
export interface SvelteStyleComment extends SvelteStyleNode {
  type: "comment"
}

export type SvelteStyleChildNode =
  | SvelteStyleAtRule
  | SvelteStyleRule
  | SvelteStyleDeclaration
  | SvelteStyleComment

type Ctx = {
  valueStartIndex: number
  value: AST.SvelteAttribute["value"]
  context: RuleContext
}

/** convert child node */
function convertChild(node: ChildNode, ctx: Ctx): SvelteStyleChildNode {
  if (node.type === "decl") {
    const range = convertRange(node, ctx)
    const declValueStartIndex =
      range[0] + node.prop.length + (node.raws.between || "").length
    const valueRange: AST.Range = [
      declValueStartIndex,
      declValueStartIndex + (node.raws.value?.value || node.value).length,
    ]
    return {
      type: "decl",
      prop: node.prop,
      value: node.value,
      important: node.important,
      range,
      valueRange,
    }
  }
  if (node.type === "atrule") {
    const range = convertRange(node, ctx)
    let nodes: SvelteStyleChildNode[] | null = null
    return {
      type: "atrule",
      range,
      get nodes() {
        return nodes ?? (nodes = node.nodes.map((n) => convertChild(n, ctx)))
      },
    }
  }
  if (node.type === "rule") {
    const range = convertRange(node, ctx)
    let nodes: SvelteStyleChildNode[] | null = null
    return {
      type: "rule",
      range,
      get nodes() {
        return nodes ?? (nodes = node.nodes.map((n) => convertChild(n, ctx)))
      },
    }
  }
  if (node.type === "comment") {
    const range = convertRange(node, ctx)
    return {
      type: "comment",
      range,
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  throw new Error(`unknown node:${(node as any).type}`)
}

/** convert range */
function convertRange(node: AnyNode, ctx: Ctx): AST.Range {
  return [
    ctx.valueStartIndex + node.source!.start!.offset,
    ctx.valueStartIndex + node.source!.end!.offset + 1,
  ]
}
