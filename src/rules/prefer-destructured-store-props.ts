import type { TSESTree } from "@typescript-eslint/types"
import type { AST } from "svelte-eslint-parser"
import { createRule } from "../utils"

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
      useDestructuring: `Destructure {{prop}} from store {{store}} for better change tracking & fewer redraws`,
      fixUseDestructuring: `Using destructuring like $: ({ {{prop}} } = {{store}}); will run faster`,
    },
    type: "suggestion",
  },
  create(context) {
    let script: AST.SvelteScriptElement
    const reports: TSESTree.MemberExpression[] = []

    return {
      [`SvelteScriptElement`](node: AST.SvelteScriptElement) {
        script = node
      },

      // {$foo.bar + baz}
      // should be
      // $: ({ bar } = $foo);
      // {bar + baz}
      [`MemberExpression[object.name=/^\\$/][property.type="Identifier"]`](
        node: TSESTree.MemberExpression,
      ) {
        reports.push(node)
      },

      [`Program:exit`]() {
        reports.forEach((node) => {
          const store = (node.object as TSESTree.Identifier).name
          const prop = (node.property as TSESTree.Identifier).name

          context.report({
            node,
            messageId: "useDestructuring",
            data: {
              store,
              prop,
            },
            suggest: [
              {
                messageId: "fixUseDestructuring",
                data: {
                  store,
                  prop,
                },

                fix(fixer) {
                  if (!script || !script.endTag) {
                    return []
                  }

                  return [
                    fixer.insertTextAfterRange(
                      [script.endTag.range[0], script.endTag.range[0]],
                      `$: ({ ${prop} } = ${store});\n`,
                    ),
                    fixer.replaceText(node, prop),
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
