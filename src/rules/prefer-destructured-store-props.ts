import type { TSESTree } from "@typescript-eslint/types"
import { createRule } from "../utils"

export default createRule("prefer-destructured-store-props", {
  meta: {
    docs: {
      description: "",
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
    return {
      // {$foo.bar + baz}
      // should be
      // $: ({ bar } = $foo);
      // {bar + baz}
      [`MemberExpression[object.name=/$/][property.type="Identifier"]`](
        node: TSESTree.MemberExpression,
      ) {
        const store = (node.object as TSESTree.Identifier).name

        // Since the regex can't specify positioning of the "$", we need to check again
        if (!store.startsWith("$")) {
          return false
        }

        const prop = (node.property as TSESTree.Identifier).name

        return context.report({
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
                return [
                  fixer.insertTextBefore(
                    node,
                    `$: ({ ${prop} } = ${store});\n`,
                  ),
                  fixer.replaceText(node, prop),
                ]
              },
            },
          ],
        })
      },
    }
  },
})
