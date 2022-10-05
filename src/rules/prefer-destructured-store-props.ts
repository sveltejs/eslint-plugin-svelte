import type { TSESTree } from "@typescript-eslint/types"
import { findVariable } from "eslint-utils"
import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { findAttribute, isExpressionIdentifier } from "../utils/ast-utils"

type StoreMemberExpression = TSESTree.MemberExpression & {
  object: TSESTree.Identifier & { name: string }
}

const keywords = new Set([
  "abstract",
  "arguments",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "double",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "final",
  "finally",
  "float",
  "for",
  "function",
  "goto",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "int",
  "interface",
  "let",
  "long",
  "native",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "volatile",
  "while",
  "with",
  "yield",
])
export default createRule("prefer-destructured-store-props", {
  meta: {
    docs: {
      description:
        "destructure values from object stores for better change tracking & fewer redraws",
      category: "Best Practices",
      recommended: false,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      useDestructuring: `Destructure {{property}} from {{store}} for better change tracking & fewer redraws`,
      fixUseDestructuring: `Using destructuring like $: ({ {{property}} } = {{store}}); will run faster`,
    },
    type: "suggestion",
  },
  create(context) {
    let mainScript: AST.SvelteScriptElement | null = null

    // Store off instances of probably-destructurable statements
    const reports: StoreMemberExpression[] = []
    let inScriptElement = false

    const storeMemberAccessStack: {
      node: StoreMemberExpression
      // A list of Identifiers that make up the member expression.
      identifiers: TSESTree.Identifier[]
    }[] = []

    /** Checks whether the given name is already defined as a variable. */
    function hasTopLevelVariable(name: string) {
      const scopeManager = context.getSourceCode().scopeManager
      if (scopeManager.globalScope?.set.has(name)) {
        return true
      }
      const moduleScope = scopeManager.globalScope?.childScopes.find(
        (s) => s.type === "module",
      )
      return moduleScope?.set.has(name) ?? false
    }

    return {
      SvelteScriptElement(node) {
        inScriptElement = true
        const scriptContext = findAttribute(node, "context")
        const contextValue =
          scriptContext?.value.length === 1 && scriptContext.value[0]
        if (
          contextValue &&
          contextValue.type === "SvelteLiteral" &&
          contextValue.value === "module"
        ) {
          // It is <script context="module">
          return
        }
        mainScript = node
      },
      "SvelteScriptElement:exit"() {
        inScriptElement = false
      },

      // {$foo.bar}
      // should be
      // $: ({ bar } = $foo);
      // {bar}
      // Same with {$foo["bar"]}
      "MemberExpression[object.type='Identifier'][object.name=/^\\$/]"(
        node: StoreMemberExpression,
      ) {
        if (inScriptElement) return // Within a script tag
        storeMemberAccessStack.unshift({ node, identifiers: [] })
      },
      Identifier(node: TSESTree.Identifier) {
        storeMemberAccessStack[0]?.identifiers.push(node)
      },
      "MemberExpression[object.type='Identifier'][object.name=/^\\$/]:exit"(
        node: StoreMemberExpression,
      ) {
        if (storeMemberAccessStack[0]?.node !== node) return
        const { identifiers } = storeMemberAccessStack.shift()!

        for (const id of identifiers) {
          if (!isExpressionIdentifier(id)) continue
          const variable = findVariable(context.getScope(), id)
          const isTopLevel =
            !variable ||
            variable.scope.type === "module" ||
            variable.scope.type === "global"
          if (!isTopLevel) {
            // Member expressions may use variables defined with {#each} etc.
            return
          }
        }
        reports.push(node)
      },

      "Program:exit"() {
        const scriptEndTag = mainScript && mainScript.endTag
        for (const node of reports) {
          const store = node.object.name

          context.report({
            node,
            messageId: "useDestructuring",
            data: {
              store,
              property: !node.computed
                ? node.property.name
                : context
                    .getSourceCode()
                    .getText(node.property)
                    .replace(/\s+/g, " "),
            },

            // Avoid suggestions for:
            //  dynamic accesses like {$foo[bar]}
            //  no <script> tag
            //  no <script> ending
            //  variable name already defined
            suggest:
              node.computed || !scriptEndTag
                ? []
                : [
                    {
                      messageId: "fixUseDestructuring",
                      data: {
                        store,
                        property: node.property.name,
                      },

                      fix(fixer) {
                        const propName = node.property.name

                        let varName = propName
                        if (varName.startsWith("$")) {
                          varName = varName.slice(1)
                        }
                        const baseName = varName
                        let suffix = 0
                        if (keywords.has(varName)) {
                          varName = `${baseName}${++suffix}`
                        }
                        while (hasTopLevelVariable(varName)) {
                          varName = `${baseName}${++suffix}`
                        }

                        return [
                          fixer.insertTextAfterRange(
                            [scriptEndTag.range[0], scriptEndTag.range[0]],
                            `$: ({ ${propName}${
                              propName !== varName ? `: ${varName}` : ""
                            } } = ${store});\n`,
                          ),
                          fixer.replaceText(node, varName),
                        ]
                      },
                    },
                  ],
          })
        }
      },
    }
  },
})
