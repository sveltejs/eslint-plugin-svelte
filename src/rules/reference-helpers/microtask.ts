import type { TSESTree } from "@typescript-eslint/types"
import { ReferenceTracker } from "@eslint-community/eslint-utils"
import type { RuleContext } from "../../types"

type FunctionName = "setTimeout" | "setInterval" | "queueMicrotask"

/**
 * Get usage of `setTimeout`, `setInterval`, `queueMicrotask`
 */
export function* extractTaskReferences(
  context: RuleContext,
  functionNames: FunctionName[] = [
    "setTimeout",
    "setInterval",
    "queueMicrotask",
  ],
): Generator<{ node: TSESTree.CallExpression; name: string }, void> {
  const referenceTracker = new ReferenceTracker(
    context.getSourceCode().scopeManager.globalScope!,
  )
  for (const { node, path } of referenceTracker.iterateGlobalReferences({
    setTimeout: {
      [ReferenceTracker.CALL]: functionNames.includes("setTimeout"),
    },
    setInterval: {
      [ReferenceTracker.CALL]: functionNames.includes("setInterval"),
    },
    queueMicrotask: {
      [ReferenceTracker.CALL]: functionNames.includes("queueMicrotask"),
    },
  })) {
    yield {
      node: node as TSESTree.CallExpression,
      name: path[path.length - 1],
    }
  }
}
