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
    let styleASTavailable = true // Starts out true so that the rule triggers in case of no <style> block.

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
          // TODO: Why multiple values?
          // TODO: Remove assertions
          for (const className of (
            (attribute as SvelteAttribute).value[0] as SvelteLiteral
          ).value.split(" ")) {
            classesUsedInTemplate[className] = node.startTag.loc
          }
        }
      },
      SvelteStyleElement(node) {
        styleASTavailable = node.body !== undefined
        if (node.body !== undefined) {
          classesUsedInStyle = findClassesInPostCSSNode(node.body)
        }
      },
      "Program:exit"() {
        if (!styleASTavailable) {
          return
        }
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
function findClassesInPostCSSNode(node: AnyNode): string[] {
  if (node.type === "rule") {
    let classes = node.nodes.map(findClassesInPostCSSNode).flat()
    const processor = selectorParser()
    classes = classes.concat(
      findClassesInSelector(processor.astSync(node.selector)),
    )
    return classes
  }
  if (["root", "atrule"].includes(node.type)) {
    return (node as Root | AtRule).nodes.map(findClassesInPostCSSNode).flat()
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
