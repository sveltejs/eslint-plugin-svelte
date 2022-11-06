import type { TSESTree } from "@typescript-eslint/types"
import type { AST } from "svelte-eslint-parser"
import { ReferenceTracker } from "eslint-utils"
import { createRule } from "../utils"
import type { RuleContext } from "../types"
import { getScope } from "../utils/ast-utils"
import { traverseNodes } from "svelte-eslint-parser"

/**  */
function extractTickReferences(
  context: RuleContext,
): { node: TSESTree.CallExpression; name: string }[] {
  const referenceTracker = new ReferenceTracker(context.getScope())
  const a = referenceTracker.iterateEsmReferences({
    svelte: {
      [ReferenceTracker.ESM]: true,
      tick: {
        [ReferenceTracker.CALL]: true,
      },
    },
  })
  return Array.from(a).map(({ node, path }) => {
    return {
      node: node as TSESTree.CallExpression,
      name: path[path.length - 1],
    }
  })
}

/** */
function extractTaskReferences(
  context: RuleContext,
): { node: TSESTree.CallExpression; name: string }[] {
  const referenceTracker = new ReferenceTracker(context.getScope())
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

/** */
function isChildNode(
  maybeAncestorNode: TSESTree.Node | AST.SvelteNode,
  node: TSESTree.Node,
) {
  let parent = node.parent
  while (parent) {
    if (parent === maybeAncestorNode) return true
    parent = parent.parent
  }
  return false
}

/**  */
function isFunctionCall(node: TSESTree.Node): boolean {
  if (node.type !== "Identifier") return false
  const { parent } = node
  if (parent?.type !== "CallExpression") return false
  return parent.callee.type === "Identifier" && parent.callee.name === node.name
}

/**  */
function isObjectNode(node: TSESTree.Identifier): boolean {
  const { parent } = node
  if (parent?.type !== "MemberExpression") return true
  if (
    parent.type === "MemberExpression" &&
    parent.object.type !== "Identifier"
  ) {
    return false
  }

  return parent.object.type !== "Identifier"
    ? false
    : parent.object.name === node.name
}

/**  */
function isReactiveVariableNode(
  context: RuleContext,
  node: TSESTree.Node,
): node is TSESTree.Identifier {
  if (node.type !== "Identifier") return false
  if (!isObjectNode(node) || isFunctionCall(node)) return false

  // Variable name starts with `$` means Svelte store.
  if (node.name.startsWith("$")) return true
  const scope = getScope(context, node)
  return scope.references.some((reference) => {
    const { resolved } = reference
    if (!resolved || resolved.name !== node.name) return false

    return resolved.defs.some((def) => {
      return (
        (def as any).parent?.parent!.type === "SvelteScriptElement" &&
        def.name.type === "Identifier" &&
        def.name.name === node.name
      )
    })
  })
}

/**  */
function isNodeUseForAssign(node: TSESTree.Identifier): boolean {
  const { parent } = node
  if (parent?.type === "AssignmentExpression") {
    return parent.left.type === "Identifier" && parent.left.name === node.name
  }
  return (
    parent?.type === "MemberExpression" &&
    parent.parent?.type === "AssignmentExpression" &&
    parent.parent.left.type === "MemberExpression" &&
    parent.parent.left.object.type === "Identifier" &&
    parent.parent.left.object.name === node.name
  )
}

/** */
function isPromiseThenOrCatch(node: TSESTree.Node): boolean {
  if (!getDeclarationBody(node)) return false
  const { parent } = node
  if (
    parent?.type !== "CallExpression" ||
    parent?.callee?.type !== "MemberExpression"
  ) {
    return false
  }
  const { property } = parent.callee
  if (property?.type !== "Identifier") return false
  return ["then", "catch"].includes(property.name)
}

/**  */
function getTrackedVariableNodes(
  context: RuleContext,
  ast: AST.SvelteReactiveStatement,
) {
  const reactiveVariableNodes: TSESTree.Identifier[] = []
  traverseNodes(ast.body, {
    enterNode(node) {
      if (isReactiveVariableNode(context, node)) {
        reactiveVariableNodes.push(node)
      }
    },
    leaveNode() {
      /* noop */
    },
  })
  return reactiveVariableNodes
}

/**  */
function getDeclarationBody(
  node: TSESTree.Node,
  functionName?: string,
): TSESTree.BlockStatement | TSESTree.Expression | null {
  if (
    node.type === "VariableDeclarator" &&
    node.id.type === "Identifier" &&
    (!functionName || node.id.name === functionName)
  ) {
    if (
      node.init?.type === "ArrowFunctionExpression" ||
      node.init?.type === "FunctionExpression"
    ) {
      return node.init.body
    }
  } else if (
    node.type === "FunctionDeclaration" &&
    node.id?.type === "Identifier" &&
    (!functionName || node.id?.name === functionName)
  ) {
    return node.body
  } else if (!functionName && node.type === "ArrowFunctionExpression") {
    return node.body
  }
  return null
}

/**  */
function getFunctionDeclarationNode(
  functionCall: TSESTree.Identifier,
): TSESTree.BlockStatement | TSESTree.Expression | null {
  let parent: AST.SvelteScriptElement | TSESTree.Node | undefined = functionCall
  let declaration: TSESTree.BlockStatement | TSESTree.Expression | null = null

  while (parent) {
    if (declaration) return declaration
    parent = parent.parent as
      | AST.SvelteScriptElement
      | TSESTree.Node
      | undefined
    if (parent && parent.type === "BlockStatement") {
      traverseNodes(parent, {
        // eslint-disable-next-line no-loop-func -- ignore
        enterNode(node) {
          declaration = getDeclarationBody(node, functionCall.name)
        },
        leaveNode() {
          /* noop */
        },
      })
    } else if (parent && parent.type === "SvelteScriptElement") {
      for (const node of parent.body) {
        if (declaration) break
        if (node.type === "VariableDeclaration") {
          for (const child of node.declarations) {
            declaration = getDeclarationBody(child, functionCall.name)
            if (declaration) break
          }
        }
      }
    }
  }

  return declaration
}

/**  */
function doLint(
  context: RuleContext,
  node: TSESTree.Node,
  callFuncIdentifiers: TSESTree.Identifier[],
  tickCallExpressions: { node: TSESTree.CallExpression; name: string }[],
  taskReferences: {
    node: TSESTree.CallExpression
    name: string
  }[],
  reactiveVariableNames: string[],
  pIsSameTask: boolean,
) {
  let isSameMicroTask = pIsSameTask

  traverseNodes(node, {
    enterNode(node) {
      // Promise.then() or Promise.catch() is called.
      if (isPromiseThenOrCatch(node)) {
        isSameMicroTask = false
      }

      // `tick`, `setTimeout`, `setInterval` , `queueMicrotask` is called
      for (const { node: callExpression } of [
        ...tickCallExpressions,
        ...taskReferences,
      ]) {
        if (isChildNode(callExpression, node)) {
          isSameMicroTask = false
        }
      }

      // left side of await block
      if (
        node.parent?.type === "AssignmentExpression" &&
        node.parent?.right.type === "AwaitExpression" &&
        node.parent?.left === node
      ) {
        isSameMicroTask = false
      }

      if (node.type === "Identifier" && isFunctionCall(node)) {
        // traverse used functions body
        const functionDeclarationNode = getFunctionDeclarationNode(node)
        if (functionDeclarationNode) {
          doLint(
            context,
            functionDeclarationNode,
            [...callFuncIdentifiers, node],
            tickCallExpressions,
            taskReferences,
            reactiveVariableNames,
            isSameMicroTask,
          )
        }
      }

      if (!isSameMicroTask) {
        if (
          isReactiveVariableNode(context, node) &&
          reactiveVariableNames.includes(node.name) &&
          isNodeUseForAssign(node)
        ) {
          context.report({
            node,
            loc: node.loc,
            messageId: "unexpected",
          })
          callFuncIdentifiers.forEach((callFuncIdentifier) => {
            context.report({
              node: callFuncIdentifier,
              loc: callFuncIdentifier.loc,
              messageId: "unexpectedCall",
              data: {
                variableName: node.name,
              },
            })
          })
        }
      }
    },
    leaveNode(node) {
      // After `await` statement runs on a different microtask.
      if (node.type === "AwaitExpression") {
        isSameMicroTask = false
      }

      // Promise.then() or Promise.catch() is called.
      if (isPromiseThenOrCatch(node)) {
        isSameMicroTask = true
      }

      // `tick`, `setTimeout`, `setInterval` , `queueMicrotask` is called
      for (const { node: callExpression } of [
        ...tickCallExpressions,
        ...taskReferences,
      ]) {
        if (isChildNode(callExpression, node)) {
          isSameMicroTask = true
        }
      }

      // left side of await block
      if (
        node.parent?.type === "AssignmentExpression" &&
        node.parent?.right.type === "AwaitExpression" &&
        node.parent?.left === node
      ) {
        isSameMicroTask = true
      }
    },
  })
}

export default createRule("infinite-reactive-loop", {
  meta: {
    docs: {
      description:
        "Svelte runtime prevents calling the same reactive statement twice in a microtask. But between different microtask, it doesn't prevent.",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected: "Possibly it may occur an infinite reactive loop.",
      unexpectedCall:
        "Possibly it may occur an infinite reactive loop because this function may update `{{variableName}}`.",
    },
    type: "suggestion",
  },
  create(context) {
    return {
      ["SvelteReactiveStatement"]: (ast: AST.SvelteReactiveStatement) => {
        const tickCallExpressions = extractTickReferences(context)
        const taskReferences = extractTaskReferences(context)
        const trackedVariableNodes = getTrackedVariableNodes(context, ast)
        doLint(
          context,
          ast.body,
          [],
          tickCallExpressions,
          taskReferences,
          trackedVariableNodes.map((node) => node.name),
          true,
        )
      },
    }
  },
})
