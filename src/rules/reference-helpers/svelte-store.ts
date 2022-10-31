import type * as ESTree from "estree"
import { ReferenceTracker } from "eslint-utils"
import type { Variable } from "eslint-scope"
import type { RuleContext } from "../../types"
import type { TS, TSTools } from "../../utils/ts-utils"
import { getTypeScriptTools } from "../../utils/ts-utils"
import { findVariable, getParent } from "../../utils/ast-utils"

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

/**
 * Creates a function that checks whether the given expression node is a store instance or not.
 */
export function createStoreChecker(
  context: RuleContext,
): (node: ESTree.Expression) => boolean {
  const tools = getTypeScriptTools(context)
  if (tools) {
    return createStoreCheckerForTS(tools)
  }

  return createStoreCheckerForES(context)
}

/**
 * Creates a function that checks whether the given expression node is a store instance or not, for EcmaScript.
 */
function createStoreCheckerForES(
  context: RuleContext,
): (node: ESTree.Expression) => boolean {
  const variables = new Set<Variable>()
  for (const { node } of extractStoreReferences(context)) {
    const parent = getParent(node)
    if (!parent) {
      continue
    }
    const id =
      // e.g. const id = writable()
      parent.type === "VariableDeclarator" && parent.id.type === "Identifier"
        ? parent.id
        : // e.g. id = writable()
        parent.type === "AssignmentExpression" &&
          parent.left.type === "Identifier"
        ? parent.left
        : null
    if (!id) {
      continue
    }

    const variable = findVariable(context, id)
    if (variable) {
      variables.add(variable)
    }
  }

  return (node) => {
    if (node.type !== "Identifier" || node.name.startsWith("$")) {
      return false
    }
    const variable = findVariable(context, node)
    if (!variable) {
      return false
    }
    return variables.has(variable)
  }
}

/**
 * Creates a function that checks whether the given expression node is a store instance or not, for TypeScript.
 */
function createStoreCheckerForTS(
  tools: TSTools,
): (node: ESTree.Expression) => boolean {
  const { service } = tools
  const checker = service.program.getTypeChecker()
  const tsNodeMap = service.esTreeNodeToTSNodeMap

  return (node) => {
    const tsNode = tsNodeMap.get(node)
    if (!tsNode) {
      return false
    }
    const type = checker.getTypeAtLocation(tsNode)

    return isStoreType(checker.getApparentType(type))

    /**
     * Checks whether the given type is a store or not
     */
    function isStoreType(type: TS.Type): boolean {
      if (type.isUnion()) {
        return type.types.some(isStoreType)
      }
      const subscribe = type.getProperty("subscribe")
      if (subscribe === undefined) {
        return false
      }
      const subscribeType = checker.getTypeOfSymbolAtLocation(
        subscribe,
        tsNode!,
      )
      return isStoreSubscribeSignatureType(subscribeType)
    }

    /**
     * Checks whether the given type is a store's subscribe or not
     */
    function isStoreSubscribeSignatureType(type: TS.Type): boolean {
      if (type.isUnion()) {
        return type.types.some(isStoreSubscribeSignatureType)
      }
      for (const signature of type.getCallSignatures()) {
        if (
          signature.parameters.length >= 2 &&
          isFunctionSymbol(signature.parameters[0]) &&
          isFunctionSymbol(signature.parameters[1])
        ) {
          return true
        }
      }
      return false
    }

    /**
     * Checks whether the given symbol is a function param or not
     */
    function isFunctionSymbol(param: TS.Symbol): boolean {
      const type: TS.Type | undefined = checker.getApparentType(
        checker.getTypeOfSymbolAtLocation(param, tsNode!),
      )
      return isFunctionType(type)
    }
  }

  /**
   * Checks whether the given symbol is a function param or not
   */
  function isFunctionType(type: TS.Type): boolean {
    if (type.isUnion()) {
      return type.types.some(isFunctionType)
    }
    return type.getCallSignatures().length > 0
  }
}
