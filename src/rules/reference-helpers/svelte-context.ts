import type { TSESTree } from "@typescript-eslint/types"
import { ReferenceTracker } from "@eslint-community/eslint-utils"
import type { RuleContext } from "../../types"

type ContextName = "setContext" | "getContext" | "hasContext" | "getAllContexts"

/** Extract svelte's context API references */
export function* extractContextReferences(
  context: RuleContext,
  contextNames: ContextName[] = [
    "setContext",
    "getContext",
    "hasContext",
    "getAllContexts",
  ],
): Generator<{ node: TSESTree.CallExpression; name: string }, void> {
  const referenceTracker = new ReferenceTracker(
    context.getSourceCode().scopeManager.globalScope!,
  )
  for (const { node, path } of referenceTracker.iterateEsmReferences({
    svelte: {
      [ReferenceTracker.ESM]: true,
      setContext: {
        [ReferenceTracker.CALL]: contextNames.includes("setContext"),
      },
      getContext: {
        [ReferenceTracker.CALL]: contextNames.includes("getContext"),
      },
      hasContext: {
        [ReferenceTracker.CALL]: contextNames.includes("hasContext"),
      },
      getAllContexts: {
        [ReferenceTracker.CALL]: contextNames.includes("getAllContexts"),
      },
    },
  })) {
    yield {
      node: node as TSESTree.CallExpression,
      name: path[path.length - 1],
    }
  }
}
