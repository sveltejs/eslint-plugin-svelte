import { createRule } from "../utils"
import type {
  SourceLocation,
  SvelteAttribute,
  SvelteLiteral,
} from "svelte-eslint-parser/lib/ast"
import {
  default as selectorParser,
  type Node,
  type Root as SelectorRoot,
} from "postcss-selector-parser"
import type { AnyNode, AtRule, Root } from "postcss"

export default createRule("no-unused-class-name", {
  meta: {
    docs: {
      description:
        "disallow the use of a class in the template without a corresponding style",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const classesUsedInTemplate: Record<string, SourceLocation> = {}
    let classesUsedInStyle: string[] = []

    return {
      SvelteElement(node) {
        if (node.kind !== "html") {
          return
        }
        for (const attribute of node.startTag.attributes) {
          // TODO: This only supports direct class attribute - what about shorthands, spread directives etc.
          if (
            !("key" in attribute) ||
            !("name" in attribute.key) ||
            !("value" in attribute) ||
            attribute.key.name !== "class"
          ) {
            continue
          }
          // TODO: Support multiple classes
          // TODO: Why multiple values?
          // TODO: Remove assertions
          classesUsedInTemplate[
            ((attribute as SvelteAttribute).value[0] as SvelteLiteral).value
          ] = node.startTag.loc
        }
      },
      SvelteStyleElement(node) {
        classesUsedInStyle = findClassesInNode(node.body)
      },
      "Program:exit"() {
        for (const className in classesUsedInTemplate) {
          if (!classesUsedInStyle.includes(className)) {
            context.report({
              loc: classesUsedInTemplate[className],
              message: `Unused class "${className}".`,
            })
          }
        }
      },
    }
  },
})

/**
 * Extract all class names used in a PostCSS node.
 */
function findClassesInNode(node: AnyNode): string[] {
  if (node.type === "rule") {
    let classes = node.nodes.map(findClassesInNode).flat()
    const processor = selectorParser()
    classes = classes.concat(
      findClassesInSelector(processor.astSync(node.selector)),
    )
    return classes
  }
  if (["root", "atrule"].includes(node.type)) {
    return (node as Root | AtRule).nodes.map(findClassesInNode).flat()
  }
  return []
}

/**
 * Extract all class names used in a PostCSS selector.
 */
function findClassesInSelector(node: Node): string[] {
  if (node.type === "class") {
    return [node.value]
  }
  if (["root", "selector"].includes(node.type)) {
    return (node as SelectorRoot).nodes.map(findClassesInSelector).flat()
  }
  return []
}
