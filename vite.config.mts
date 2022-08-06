// @ts-expect-error -- Missing type information
import { sveltekit } from "@sveltejs/kit/vite"
import path from "path"
import svelteMd from "vite-plugin-svelte-md"
import svelteMdOption from "./docs-svelte-kit/tools/vite-plugin-svelte-md-option.mjs"

import "./docs-svelte-kit/build-system/build.mts"
import type { UserConfig } from "vite"
import { fileURLToPath } from "url"

const dirname = path.dirname(
  fileURLToPath(
    // @ts-expect-error -- Cannot change `module` option
    import.meta.url,
  ),
)

/** @type {import('vite').UserConfig} */
const config: UserConfig = {
  plugins: [
    svelteMd(
      svelteMdOption({
        baseUrl: "/eslint-plugin-svelte",
        root: path.join(dirname, "./docs"),
      }),
    ),
    sveltekit(),
  ],
  server: {
    fs: { strict: false },
  },
  resolve: {
    alias: {
      eslint: path.join(dirname, "./docs-svelte-kit/shim/eslint.mjs"),
      assert: path.join(dirname, "./docs-svelte-kit/shim/assert.mjs"),
      "postcss-load-config": path.join(
        dirname,
        "./docs-svelte-kit/shim/postcss-load-config.mjs",
      ),
      "source-map-js": path.join(
        dirname,
        "./docs-svelte-kit/shim/source-map-js.mjs",
      ),
      module: path.join(dirname, "./docs-svelte-kit/shim/module.mjs"),
      path: path.join(dirname, "./docs-svelte-kit/shim/path.mjs"),
      url: path.join(dirname, "./docs-svelte-kit/shim/url.mjs"),
      os: path.join(dirname, "./docs-svelte-kit/shim/os.mjs"),
      fs: path.join(dirname, "./docs-svelte-kit/shim/fs.mjs"),
      globby: path.join(dirname, "./docs-svelte-kit/shim/globby.mjs"),
      tslib: path.join(dirname, "./node_modules/tslib/tslib.es6.js"),

      // Alias to CJS
      "svelte/compiler": path.join(
        dirname,
        "./node_modules/svelte/compiler.js",
      ),
      "eslint-visitor-keys": path.join(
        dirname,
        "./node_modules/eslint-visitor-keys/dist/eslint-visitor-keys.cjs",
      ),
      espree: path.join(dirname, "./node_modules/espree/dist/espree.cjs"),
      "eslint-scope": path.join(
        dirname,
        "./node_modules/eslint-scope/dist/eslint-scope.cjs",
      ),
      acorn: path.join(dirname, "./node_modules/acorn/dist/acorn.js"),
    },
  },
  ssr: {
    // vite-plugin-svelte recognizes svelte-eslint-parser as a library that runs on svelte.
    // This confuses the SSR on the Dev server.
    // This is the workaround for that.
    // https://github.com/sveltejs/vite-plugin-svelte/blob/a1d141e890ac0d1572a46e2bec705aa090236560/packages/vite-plugin-svelte/src/utils/dependencies.ts#L114
    external: ["svelte-eslint-parser"],
  },
  build: {
    commonjsOptions: {
      ignoreDynamicRequires: true,
    },
  },
}

export default config
