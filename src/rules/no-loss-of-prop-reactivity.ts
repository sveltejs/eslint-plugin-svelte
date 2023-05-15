import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import type { TSESTree } from "@typescript-eslint/types"
import { findAttribute, findVariable } from "../utils/ast-utils"
import { getStaticAttributeValue } from "../utils/ast-utils"

export default createRule("no-loss-of-prop-reactivity", {
  meta: {
    docs: {
      description: "disallow the use of props that potentially lose reactivity",
      category: "Best Practices",
      recommended: false,
    },
    schema: [],
    messages: {
      potentiallyLoseReactivity:
        "Referencing props that potentially lose reactivity should be avoided.",
    },
    type: "suggestion",
  },
  create(context) {
    if (!context.parserServices.isSvelte) {
      return {}
    }
    let contextModule: AST.SvelteScriptElement | null = null
    let scriptNode: AST.SvelteScriptElement | null = null
    const reactiveStatements: AST.SvelteReactiveStatement[] = []
    const functions: TSESTree.FunctionLike[] = []
    const props = new Set<TSESTree.Identifier>()
    return {
      SvelteScriptElement(node: AST.SvelteScriptElement) {
        const contextAttr = findAttribute(node, "context")
        if (contextAttr && getStaticAttributeValue(contextAttr) === "module") {
          contextModule = node
          return
        }

        scriptNode = node
      },
      SvelteReactiveStatement(node: AST.SvelteReactiveStatement) {
        reactiveStatements.push(node)
      },
      ":function"(node: TSESTree.FunctionLike) {
        functions.push(node)
      },
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        if (
          contextModule &&
          contextModule.range[0] < node.range[0] &&
          node.range[1] < contextModule.range[1]
        ) {
          return
        }
        if (
          node.declaration?.type === "VariableDeclaration" &&
          (node.declaration.kind === "let" || node.declaration.kind === "var")
        ) {
          for (const decl of node.declaration.declarations) {
            if (decl.id.type === "Identifier") {
              props.add(decl.id)
            }
          }
        }
        for (const spec of node.specifiers) {
          if (spec.exportKind === "type") {
            continue
          }
          if (isMutableProp(spec.local)) {
            props.add(spec.exported)
          }
        }
      },
      "Program:exit"() {
        for (const prop of props) {
          const variable = findVariable(context, prop)
          if (
            !variable ||
            // ignore multiple definitions
            variable.defs.length > 1
          ) {
            return
          }
          for (const reference of variable.references) {
            if (reference.isWrite()) continue
            const id = reference.identifier as TSESTree.Identifier
            if (
              variable.defs.some(
                (def) =>
                  def.node.range[0] <= id.range[0] &&
                  id.range[1] <= def.node.range[1],
              )
            ) {
              // The reference is in the variable definition.
              continue
            }
            if (isInReactivityScope(id)) continue

            context.report({
              node: id,
              messageId: "potentiallyLoseReactivity",
            })
          }
        }
      },
    }

    /** Checks whether given prop id is mutable variable or not */
    function isMutableProp(id: TSESTree.Identifier) {
      const variable = findVariable(context, id)
      if (!variable || variable.defs.length === 0) {
        return false
      }
      return variable.defs.every((def) => {
        if (def.type !== "Variable") {
          return false
        }
        return def.parent.kind === "let" || def.parent.kind === "var"
      })
    }

    /** Checks whether given id is in potentially reactive scope or not */
    function isInReactivityScope(id: TSESTree.Identifier) {
      if (
        !scriptNode ||
        id.range[1] <= scriptNode.range[0] ||
        scriptNode.range[1] <= id.range[0]
      ) {
        // The reference is in the template.
        return true
      }
      if (
        reactiveStatements.some(
          (node) =>
            node.range[0] <= id.range[0] && id.range[1] <= node.range[1],
        )
      ) {
        // The reference is in the reactive statement.
        return true
      }
      if (
        functions.some(
          (node) =>
            node.range[0] <= id.range[0] && id.range[1] <= node.range[1],
        )
      ) {
        // The reference is in the function.
        return true
      }
      return false
    }
  },
})
