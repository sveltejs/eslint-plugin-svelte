import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import type { RuleContext } from "../types"

const DEFAULT_ORDER = [
  "SvelteElement([svelte:options])",
  "SvelteScriptElement([context=module])",
  "SvelteScriptElement",
  "SvelteElement([svelte:window])",
  "SvelteElement([svelte:document])",
  "SvelteElement([svelte:head])",
  "SvelteElement([svelte:body])",
  "SvelteElement",
  "SvelteStyleElement",
] as const

/** Return component name.  */
function getComponentTagName(
  element: AST.SvelteMemberExpressionName,
  pBaseName = "",
): string {
  const { object } = element
  if (object.type === "SvelteMemberExpressionName") {
    const { name } = object.property
    const baseName = pBaseName ? `${pBaseName}.${name}` : name
    if (baseName) {
      return `${baseName}.${getComponentTagName(object, baseName)}`
    }
    return getComponentTagName(object, baseName)
  }
  return object.name
}

/** Get SvelteElement tag name */
function getTagName(element: AST.SvelteElement): string {
  if (element.name.type === "SvelteMemberExpressionName") {
    return getComponentTagName(element.name)
  }
  return element.name.name
}

/** Get attributes as string for <script> and <style> */
function getAttributesAsString(
  element: AST.SvelteScriptElement | AST.SvelteStyleElement,
) {
  const attrs: string[] = []
  for (const attr of element.startTag.attributes) {
    if (attr.type !== "SvelteAttribute") continue
    const key = attr.key.name
    for (const value of attr.value) {
      if (value.type === "SvelteLiteral") {
        attrs.push(`${key}=${value.value}`)
      }
    }
  }
  return attrs
}

type OrderOption = {
  type: string
  attrs: string[]
}

/** Get sort order option. */
function getOptionOrders(context: RuleContext): OrderOption[] {
  const orderOptions: string[] =
    (context.options[0] && context.options[0].order) || DEFAULT_ORDER
  return orderOptions.map((option) => {
    const type = option.split("(")[0].trim()
    const attrs =
      /.*\(\[(.*)\]\)/
        .exec(option)?.[1]
        ?.split(",")
        ?.map((a) => a.trim()) ?? []
    return { type, attrs }
  })
}

/** Get top lavel nodes and its order */
function getNodeAndOrders(
  orderOptions: OrderOption[],
  node: AST.SvelteProgram,
) {
  const nodeAndOrders: {
    node: (typeof node.body)[number]
    attrs: string[]
    order: number
  }[] = []
  for (const child of node.body) {
    if (
      child.type === "SvelteScriptElement" ||
      child.type === "SvelteStyleElement"
    ) {
      const attrs = getAttributesAsString(child)
      for (const [index, option] of orderOptions.entries()) {
        if (option.type !== child.type) continue
        if (
          option.attrs.filter((a) => attrs.includes(a)).length ===
          option.attrs.length
        ) {
          nodeAndOrders.push({ node: child, attrs, order: index })
          break
        }
      }
    } else if (child.type === "SvelteElement") {
      const tagName = getTagName(child)
      for (const [index, option] of orderOptions.entries()) {
        if (option.type !== child.type) continue
        if (option.attrs.length === 0 || option.attrs.includes(tagName)) {
          nodeAndOrders.push({ node: child, attrs: [], order: index })
          break
        }
      }
    }
  }

  return nodeAndOrders
}

/** Get element name for ESLint report */
function getElementNameForReport(node: AST.SvelteProgram["body"][number]) {
  return node.type === "SvelteElement"
    ? getTagName(node)
    : node.type === "SvelteScriptElement"
    ? "script"
    : "style"
}

/** Get element attributes for ESLint report */
function getElementAttrsForReport(attrs: string[]) {
  if (attrs.length === 0) return ""
  return ` ${attrs
    .map((a) => {
      const [key, value] = a.split("=")
      return `${key}="${value}"`
    })
    .join(" ")}`
}

export default createRule("component-tags-order", {
  meta: {
    docs: {
      description: "Enforce order of component top-level elements",
      category: "Stylistic Issues",
      conflictWithPrettier: false,
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          order: {
            type: "array",
            items: {
              type: "string",
            },
            uniqueItems: true,
            additionalItems: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpected:
        "'<{{elementName}}{{elementAttributes}}>' should be above '<{{firstUnorderedName}}{{firstUnorderedAttributes}}>' on line {{line}}.",
    },
    type: "suggestion",
    fixable: "code",
  },
  create(context) {
    const sourceCode = context.getSourceCode()
    const orderOptions = getOptionOrders(context)
    return {
      Program(node) {
        if (node.body.length === 0) return

        const nodeAndOrders = getNodeAndOrders(orderOptions, node)
        const sorted = [...nodeAndOrders].sort((a, b) => a.order - b.order)

        let currentOrder = nodeAndOrders[0].order
        for (const nodeAndOrder of nodeAndOrders) {
          const { node, order } = nodeAndOrder
          if (currentOrder <= order) {
            currentOrder = order
            continue
          }

          const expectedPrev = sorted.filter((n) => n.order > order)[0]

          context.report({
            node,
            loc: node.loc,
            messageId: "unexpected",
            data: {
              elementName: getElementNameForReport(node),
              elementAttributes: getElementAttrsForReport(nodeAndOrder.attrs),
              firstUnorderedName: expectedPrev
                ? getElementNameForReport(expectedPrev?.node)
                : "root",
              firstUnorderedAttributes: expectedPrev
                ? getElementAttrsForReport(expectedPrev.attrs)
                : "",
              line: `${expectedPrev?.node?.loc.start.line ?? 1}`,
            },
            *fix(fixer) {
              for (const [index, nodeAndOrder] of nodeAndOrders.entries()) {
                const fixed = sorted[index]
                if (nodeAndOrder.node === fixed.node) continue
                yield fixer.replaceTextRange(
                  fixed.node.range,
                  sourceCode.text.slice(...nodeAndOrder.node.range),
                )
              }
            },
          })
        }
      },
    }
  },
})
