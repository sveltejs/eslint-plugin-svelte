import type { TSESTree } from "@typescript-eslint/types"
import type { AST } from "svelte-eslint-parser"
import { ReferenceTracker } from "eslint-utils"
import { createRule } from "../utils"
import type { RuleContext } from "../types"
import { getScope } from "../utils/ast-utils"
import { traverseNodes } from "svelte-eslint-parser"

/**
 * Get usage of `tick`
 */
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

/**
 * Get usage of `setTimeout`, `setInterval`, `queueMicrotask`
 */
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

/**
 * If `node` is inside of `maybeAncestorNode`, return true.
 */
function isChildNode(
  maybeAncestorNode: TSESTree.Node | AST.SvelteNode,
  node: TSESTree.Node,
): boolean {
  let parent = node.parent
  while (parent) {
    if (parent === maybeAncestorNode) return true
    parent = parent.parent
  }
  return false
}

/**
 * Return true if `node` is a function call.
 */
function isFunctionCall(node: TSESTree.Node): boolean {
  if (node.type !== "Identifier") return false
  const { parent } = node
  if (parent?.type !== "CallExpression") return false
  return parent.callee.type === "Identifier" && parent.callee.name === node.name
}

/**
 * Return true if `node` is a variable.
 *
 * e.g. foo.bar
 * If node is `foo`, return true.
 * If node is `bar`, return false.
 *
 * e.g. let baz = 1
 * If node is `baz`, return true.
 */
function isVariableNode(node: TSESTree.Identifier): boolean {
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

/**
 * Return true if `node` is a reactive variable.
 */
function isReactiveVariableNode(
  context: RuleContext,
  node: TSESTree.Node,
): node is TSESTree.Identifier {
  if (node.type !== "Identifier") return false
  if (!isVariableNode(node) || isFunctionCall(node)) return false

  // Variable name starts with `$` means Svelte store.
  if (node.name.startsWith("$")) return true
  const scope = getScope(context, node)
  return scope.references.some((reference) => {
    const { resolved } = reference
    if (!resolved || resolved.name !== node.name) return false

    return resolved.defs.some((def) => {
      return (
        (def as any).parent?.parent?.type === "SvelteScriptElement" &&
        def.name.type === "Identifier" &&
        def.name.name === node.name
      )
    })
  })
}

/**
 * e.g. foo.bar = baz + 1
 * If node is `foo`, return true.
 * Otherwise, return false.
 */
function isNodeForAssign(node: TSESTree.Identifier): boolean {
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

/**
 * Return true if `node` is inside of `then` or `catch`.
 */
function isPromiseThenOrCatchBody(node: TSESTree.Node): boolean {
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

/**
 * Get all tracked reactive variables.
 */
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
          if (!declaration) {
            declaration = getDeclarationBody(node, functionCall.name)
          }
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
function isInsideOfFunction(node: TSESTree.Node) {
  let parent: TSESTree.Node | AST.SvelteReactiveStatement | null = node
  while (parent) {
    parent = parent.parent as TSESTree.Node | AST.SvelteReactiveStatement | null
    if (!parent) break
    if (parent.type === "FunctionDeclaration" && parent.async) return true
    if (
      parent.type === "VariableDeclarator" &&
      (parent.init?.type === "FunctionExpression" ||
        parent.init?.type === "ArrowFunctionExpression") &&
      parent.init?.async
    ) {
      return true
    }
  }
  return false
}

/**  */
function doLint(
  context: RuleContext,
  ast: TSESTree.Node,
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

  traverseNodes(ast, {
    enterNode(node) {
      // Promise.then() or Promise.catch() is called.
      if (isPromiseThenOrCatchBody(node)) {
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
          isNodeForAssign(node)
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
      if (node.type === "AwaitExpression") {
        if ((ast.parent?.type as string) === "SvelteReactiveStatement") {
          if (!isInsideOfFunction(node)) {
            isSameMicroTask = false
          }
        } else {
          isSameMicroTask = false
        }
      }

      // Promise.then() or Promise.catch() is called.
      if (isPromiseThenOrCatchBody(node)) {
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
