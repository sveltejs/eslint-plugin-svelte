import type { TSESTree } from "@typescript-eslint/types"
import { ReferenceTracker } from "@eslint-community/eslint-utils"
import type { RuleContext } from "../../types"

/**
 * Get usage of `setTimeout`, `setInterval`, `queueMicrotask`
 */
export function extractTaskReferences(
  context: RuleContext,
): { node: TSESTree.CallExpression; name: string }[] {
  const referenceTracker = new ReferenceTracker(
    context.getSourceCode().scopeManager.globalScope!,
  )
  const a = referenceTracker.iterateGlobalReferences({
    setTimeout: { [ReferenceTracker.CALL]: true },
    setInterval: { [ReferenceTracker.CALL]: true },
    queueMicrotask: { [ReferenceTracker.CALL]: true },
  })
  return Array.from(a).map(({ node, path }) => {
    return {
      node: node as TSESTree.CallExpression,
      name: path[path.length - 1],
    }
  })
}
