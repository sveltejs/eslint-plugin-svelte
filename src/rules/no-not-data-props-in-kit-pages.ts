import type { AST } from "svelte-eslint-parser"
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
    let isScript = false
    return {
      // <script>
      [`Program > SvelteScriptElement > SvelteStartTag`]: (
        node: AST.SvelteStartTag,
      ) => {
        // except for <script context="module">
        isScript = !node.attributes.some(
          (a) =>
            a.type === "SvelteAttribute" &&
            a.key.name === "context" &&
            a.value.some(
              (v) => v.type === "SvelteLiteral" && v.value === "module",
            ),
        )
      },

      // </script>
      "Program > SvelteScriptElement:exit": () => {
        isScript = false
      },

      // export let xxx
      [`ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > Identifier`]:
        (node: ESTree.Identifier) => {
          if (!isScript) return {}
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
