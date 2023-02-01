import type { TSESTree } from "@typescript-eslint/types"
import { ReferenceTracker } from "eslint-utils"
import type { RuleContext } from "../../types"

/** Extract 'svelte createEventDispatcher' references */
export function* extractCreateEventDispatcherReferences(
  context: RuleContext,
): Generator<TSESTree.CallExpression, void> {
  const referenceTracker = new ReferenceTracker(context.getScope())
  for (const { node } of referenceTracker.iterateEsmReferences({
    svelte: {
      [ReferenceTracker.ESM]: true,
      createEventDispatcher: {
        [ReferenceTracker.CALL]: true,
      },
    },
  })) {
    yield node as TSESTree.CallExpression
  }
}
