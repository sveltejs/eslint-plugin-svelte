import type * as ESTree from "estree"
import { createRule } from "../utils"
import { isKitPageComponent } from "../utils/svelte-kit"

const EXPECTED_PROP_NAMES = ["data", "errors"]

export default createRule("no-not-data-props-in-kit-pages", {
  meta: {
    docs: {
      description:
        "Disallow props other than data or errors in Svelte Kit page components.",
      category: "Possible Errors",
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected:
        "Disallow props other than data or errors in Svelte Kit page components.",
    },
    type: "problem",
  },
  create(context) {
    if (!isKitPageComponent(context)) return {}
    let isModule = false
    return {
      // <script context="module">
      [`Program > SvelteScriptElement > SvelteStartTag > SvelteAttribute[key.name="context"] > SvelteLiteral[value="module"]`]:
        () => {
          isModule = true
        },

      // <script>
      [`Program > SvelteScriptElement > SvelteStartTag > SvelteAttribute[key.name="context"] > SvelteLiteral[value!="module"]`]:
        () => {
          isModule = false
        },

      // </script>
      ["SvelteEndTag"]: () => {
        isModule = false
      },

      // export let xxx
      [`ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > Identifier`]:
        (node: ESTree.Identifier) => {
          if (isModule) return {}
          const { name } = node
          if (EXPECTED_PROP_NAMES.includes(name)) return {}
          return context.report({
            node,
            loc: node.loc!,
            messageId: "unexpected",
          })
        },
    }
  },
})
