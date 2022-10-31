import type * as ESTree from "estree"
import { createRule } from "../utils"
import { isKitPageComponent, hasSvelteKit } from "./kit-helpers/kit-helpers"

export default createRule("no-export-load-in-svelte-module-in-kit-pages", {
  meta: {
    docs: {
      description:
        "disallow exporting load functions in `*.svelte` module in Svelte Kit page components.",
      category: "Possible Errors",
      // TODO Switch to recommended in the major version.
      recommended: false,
    },
    schema: [],
    messages: {
      unexpected:
        "disallow exporting load functions in `*.svelte` module in Svelte Kit page components.",
    },
    type: "problem",
  },
  create(context) {
    if (!hasSvelteKit || !isKitPageComponent(context)) return {}
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
      "Program > SvelteScriptElement:exit": () => {
        isModule = false
      },

      // export function load() {}
      // export const load = () => {}
      [`ExportNamedDeclaration :matches(FunctionDeclaration, VariableDeclaration > VariableDeclarator) > Identifier[name="load"]`]:
        (node: ESTree.Identifier) => {
          if (!isModule) return {}
          return context.report({
            node,
            loc: node.loc!,
            messageId: "unexpected",
          })
        },
    }
  },
})
