import type { TSESTree } from "@typescript-eslint/types"
import { ReferenceTracker } from "@eslint-community/eslint-utils"
import type { RuleContext } from "../../types"

type LifeCycleName =
  | "onMount"
  | "beforeUpdate"
  | "afterUpdate"
  | "onDestroy"
  | "tick"

/**
 * Get usage of Svelte life cycle functions.
 */
export function* extractSvelteLifeCycleReferences(
  context: RuleContext,
  fuctionName: LifeCycleName[] = [
    "onMount",
    "beforeUpdate",
    "afterUpdate",
    "onDestroy",
    "tick",
  ],
): Generator<{ node: TSESTree.CallExpression; name: string }, void> {
  const referenceTracker = new ReferenceTracker(
    context.getSourceCode().scopeManager.globalScope!,
  )
  for (const { node, path } of referenceTracker.iterateEsmReferences({
    svelte: {
      [ReferenceTracker.ESM]: true,
      onMount: {
        [ReferenceTracker.CALL]: fuctionName.includes("onMount"),
      },
      beforeUpdate: {
        [ReferenceTracker.CALL]: fuctionName.includes("beforeUpdate"),
      },
      afterUpdate: {
        [ReferenceTracker.CALL]: fuctionName.includes("afterUpdate"),
      },
      onDestroy: {
        [ReferenceTracker.CALL]: fuctionName.includes("onDestroy"),
      },
      tick: {
        [ReferenceTracker.CALL]: fuctionName.includes("tick"),
      },
    },
  })) {
    yield {
      node: node as TSESTree.CallExpression,
      name: path[path.length - 1],
    }
  }
}
