import type * as ESTree from "estree"
import { createRule } from "../utils"
import fs from "fs"

const hasSvelteKit = (() => {
  try {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"))
    // Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
    // So always it returns true if it runs on the package.
    if (packageJson.name === "eslint-plugin-svelte") return true
    return Boolean(
      packageJson.dependencies["@sveltejs/kit"] ??
        packageJson.devDependencies["@sveltejs/kit"],
    )
  } catch (_e) {
    return false
  }
})()

export default createRule("no-export-load-in-svelte-module-in-kit-pages", {
  meta: {
    docs: {
      description:
        "Disallow exporting load functions in `*.svelte` module in Svelte Kit page components.",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [],
    messages: {
      unexpected:
        "Disallow exporting load functions in `*.svelte` module in Svelte Kit page components.",
    },
    type: "problem",
  },
  create(context) {
    if (!hasSvelteKit) return {}
    let isModule = false
    return {
      // <script context="module">
      [`Program > SvelteScriptElement > SvelteStartTag > SvelteAttribute > SvelteLiteral[value="module"]`]:
        () => {
          isModule = true
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
