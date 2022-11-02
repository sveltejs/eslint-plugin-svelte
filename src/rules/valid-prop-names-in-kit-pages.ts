import type { AST } from "svelte-eslint-parser"
import type * as ESTree from "estree"
import { createRule } from "../utils"
import { isKitPageComponent } from "../utils/svelte-kit"

const EXPECTED_PROP_NAMES = ["data", "errors"]

export default createRule("valid-prop-names-in-kit-pages", {
  meta: {
    docs: {
      description:
        "disallow props other than data or errors in Svelte Kit page components.",
      category: "Possible Errors",
      // TODO Switch to recommended in the major version.
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected:
        "disallow props other than data or errors in Svelte Kit page components.",
    },
    type: "problem",
  },
  create(context) {
    if (!isKitPageComponent(context)) return {}
    let isScript = false
    return {
      // <script>
      "Program > SvelteScriptElement > SvelteStartTag": (
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

      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator": (
        node: ESTree.VariableDeclarator,
      ) => {
        if (!isScript) return

        // export let foo
        if (node.id.type === "Identifier") {
          if (!EXPECTED_PROP_NAMES.includes(node.id.name)) {
            context.report({
              node,
              loc: node.loc!,
              messageId: "unexpected",
            })
          }
          return
        }

        // export let { xxx, yyy } = zzz
        if (node.id.type !== "ObjectPattern") return
        for (const p of node.id.properties) {
          if (
            p.type === "Property" &&
            p.value.type === "Identifier" &&
            !EXPECTED_PROP_NAMES.includes(p.value.name)
          ) {
            context.report({
              node: p.value,
              loc: p.value.loc!,
              messageId: "unexpected",
            })
          }
        }
      },
    }
  },
})
