import type * as ESTree from "estree"
import type { TSESTree } from "@typescript-eslint/types"
import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { getStringIfConstant } from "../utils/ast-utils"
import { returnStatement } from "@babel/types"

type NodeRecord = { property: string; node: TSESTree.MemberExpression }

export default createRule("prefer-destructured-store-props", {
  meta: {
    docs: {
      description:
        "Destructure values from object stores for better change tracking & fewer redraws",
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
    let script: AST.SvelteScriptElement

    // Store off instances of probably-destructurable statements
    const reports: NodeRecord[] = []

    // Store off defined variable names so we can avoid offering a suggestion in those cases
    const defined: Set<string> = new Set()

    return {
      [`SvelteScriptElement`](node: AST.SvelteScriptElement) {
        script = node
      },

      [`VariableDeclarator[id.type="Identifier"]`](
        node: TSESTree.VariableDeclarator,
      ) {
        const { name } = node.id as TSESTree.Identifier

        defined.add(name)
      },

      // {$foo.bar}
      // should be
      // $: ({ bar } = $foo);
      // {bar}
      // Same with {$foo["bar"]}
      [`MemberExpression[object.name=/^\\$/]`](
        node: TSESTree.MemberExpression,
      ) {
        const property =
          node.property.type === "Identifier"
            ? node.property.name
            : getStringIfConstant(node.property as ESTree.Expression)

        if (!property) {
          return
        }

        reports.push({ property, node })
      },

      [`Program:exit`]() {
        reports.forEach(({ property, node }) => {
          const store = (node.object as TSESTree.Identifier).name

          context.report({
            node,
            messageId: "useDestructuring",
            data: {
              store,
              property,
            },

            // Avoid suggestions for:
            //  dynamic accesses like {$foo[bar]}
            //  no <script> tag
            //  no <script> ending
            //  variable name already defined
            suggest:
              node.computed ||
              !script ||
              !script.endTag ||
              defined.has(property)
                ? []
                : [
                    {
                      messageId: "fixUseDestructuring",
                      data: {
                        store,
                        property,
                      },

                      fix(fixer) {
                        // This is only necessary to make TS shut up about script.endTag maybe being null
                        // but since we already checked it above that warning is just wrong
                        if (!script.endTag) {
                          return []
                        }

                        return [
                          fixer.insertTextAfterRange(
                            [script.endTag.range[0], script.endTag.range[0]],
                            `$: ({ ${property} } = ${store});\n`,
                          ),
                          fixer.replaceText(node, property),
                        ]
                      },
                    },
                  ],
          })
        })
      },
    }
  },
})
