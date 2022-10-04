import type * as ESTree from "estree"
import { ReferenceTracker } from "eslint-utils"
import type { RuleContext } from "../../types"

type StoreName = "writable" | "readable" | "derived"

/** Extract 'svelte/store' references */
export function* extractStoreReferences(
  context: RuleContext,
  storeNames: StoreName[] = ["writable", "readable", "derived"],
): Generator<{ node: ESTree.CallExpression; name: string }, void> {
  const referenceTracker = new ReferenceTracker(context.getScope())
  for (const { node, path } of referenceTracker.iterateEsmReferences({
    "svelte/store": {
      [ReferenceTracker.ESM]: true,
      writable: {
        [ReferenceTracker.CALL]: storeNames.includes("writable"),
      },
      readable: {
        [ReferenceTracker.CALL]: storeNames.includes("readable"),
      },
      derived: {
        [ReferenceTracker.CALL]: storeNames.includes("derived"),
      },
    },
  })) {
    yield {
      node: node as ESTree.CallExpression,
      name: path[path.length - 1],
    }
  }
}
