import type { TSESTree } from "@typescript-eslint/types"

/**
 * Return true if `node` is inside of `then` or `catch`.
 */
export function isInsideOfPromiseThenOrCatch(node: TSESTree.Node): boolean {
  let parent: TSESTree.Node | undefined = node.parent
  while (parent) {
    parent = parent.parent
    if (parent?.type !== "ExpressionStatement") {
      continue
    }
    const expression = parent?.expression
    if (expression == null || expression?.type !== "CallExpression") {
      return false
    }

    const callee = expression.callee
    if (callee.type !== "MemberExpression") {
      return false
    }

    const property = callee.property
    return (
      property.type === "Identifier" &&
      ["then", "catch"].includes(property.name)
    )
  }

  return false
}
