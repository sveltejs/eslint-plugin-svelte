import type * as ESTree from "estree"
import { ReferenceTracker } from "eslint-utils"
import type { RuleContext } from "../../types"

/** Extract 'svelte/store' references */
export function* extractStoreReferences(
  context: RuleContext,
): Generator<{ node: ESTree.CallExpression; name: string }, void> {
  const referenceTracker = new ReferenceTracker(context.getScope())
  for (const { node, path } of referenceTracker.iterateEsmReferences({
    "svelte/store": {
      [ReferenceTracker.ESM]: true,
      writable: {
        [ReferenceTracker.CALL]: true,
      },
      readable: {
        [ReferenceTracker.CALL]: true,
      },
      derived: {
        [ReferenceTracker.CALL]: true,
      },
    },
  })) {
    yield {
      node: node as ESTree.CallExpression,
      name: path[path.length - 1],
    }
  }
}
