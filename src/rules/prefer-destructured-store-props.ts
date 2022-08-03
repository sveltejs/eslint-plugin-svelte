import type * as ESTree from "estree"
import type { TSESTree } from "@typescript-eslint/types"
import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"
import { getStringIfConstant } from "../utils/ast-utils"

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
      useDestructuring: `Destructure {{property}} from store {{store}} for better change tracking & fewer redraws`,
      fixUseDestructuring: `Using destructuring like $: ({ {{property}} } = {{store}}); will run faster`,
    },
    type: "suggestion",
  },
  create(context) {
    let script: AST.SvelteScriptElement
    const reports: NodeRecord[] = []

    return {
      [`SvelteScriptElement`](node: AST.SvelteScriptElement) {
        script = node
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
          // let prop: string | null = null

          // if (node.property.type === "Literal") {
          //   prop = node.property.value as string
          // } else if (node.property.type === "Identifier") {
          //   prop = node.property.name
          // }

          context.report({
            node,
            messageId: "useDestructuring",
            data: {
              store,
              property,
            },

            suggest: [
              {
                messageId: "fixUseDestructuring",
                data: {
                  store,
                  property,
                },

                fix(fixer) {
                  // Avoid autofix suggestions for:
                  //  dynamic accesses like {$foo[bar]}
                  //  no <script> tag
                  //  no <script> ending
                  if (node.computed || !script || !script.endTag) {
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
