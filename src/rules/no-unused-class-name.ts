import { createRule } from "../utils"
import type {
  ESLintCompatiblePostCSSNode,
  SourceLocation,
  SvelteAttribute,
  SvelteDirective,
  SvelteShorthandAttribute,
  SvelteSpecialDirective,
  SvelteSpreadAttribute,
  SvelteStyleDirective,
} from "svelte-eslint-parser/lib/ast"
import { default as selectorParser, type Node } from "postcss-selector-parser"

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
        const classes = node.startTag.attributes.flatMap(findClassesInAttribute)
        for (const className of classes) {
          classesUsedInTemplate[className] = node.startTag.loc
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
 * Extract all class names used in a HTML element attribute.
 */
function findClassesInAttribute(
  attribute:
    | SvelteAttribute
    | SvelteShorthandAttribute
    | SvelteSpreadAttribute
    | SvelteDirective
    | SvelteStyleDirective
    | SvelteSpecialDirective,
): string[] {
  if (attribute.type === "SvelteAttribute" && attribute.key.name === "class") {
    return attribute.value.flatMap((value) =>
      value.type === "SvelteLiteral" ? value.value.split(" ") : [],
    )
  }
  if (attribute.type === "SvelteDirective" && attribute.kind === "Class") {
    return [attribute.key.name.name]
  }
  return []
}

/**
 * Extract all class names used in a PostCSS node.
 */
function findClassesInPostCSSNode(node: ESLintCompatiblePostCSSNode): string[] {
  if (node.type === "SvelteStyle-rule") {
    let classes = node.nodes.flatMap(findClassesInPostCSSNode)
    const processor = selectorParser()
    classes = classes.concat(
      findClassesInSelector(processor.astSync(node.selector)),
    )
    return classes
  }
  if (node.type === "SvelteStyle-root" || node.type === "SvelteStyle-atrule") {
    return node.nodes.flatMap(findClassesInPostCSSNode)
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
  if (node.type === "root" || node.type === "selector") {
    return node.nodes.flatMap(findClassesInSelector)
  }
  return []
}
