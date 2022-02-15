/* global __dirname -- __dirname */
import ghpagesAdapter from "svelte-adapter-ghpages"
import path from "path"
import svelteMd from "vite-plugin-svelte-md"
import svelteMdOption from "./docs-svelte-kit/tools/vite-plugin-svelte-md-option.mjs"

import "./docs-svelte-kit/build-system/build.js"

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : (() => {
        const metaUrl = Function(`return import.meta.url`)()
        return path.dirname(new URL(metaUrl).pathname)
      })()

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    preserveWhitespace: true,
  },
  extensions: [".svelte", ".md"],
  kit: {
    paths: {
      base: "/eslint-plugin-svelte",
    },
    adapter: ghpagesAdapter({
      // default options are shown
      pages: "build",
      assets: "build",
    }),
    files: {
      routes: path.join(dirname, "./docs"),
      template: path.join(dirname, "./docs-svelte-kit/src/app.html"),
      hooks: path.join(dirname, "./docs-svelte-kit/src/hooks"),
      lib: path.join(dirname, "./docs-svelte-kit/src/lib"),
      assets: path.join(dirname, "./docs-svelte-kit/statics"),
    },

    trailingSlash: "always",

    vite: {
      server: {
        fs: { strict: false },
      },
      resolve: {
        alias: {
          eslint: path.join(dirname, "./docs-svelte-kit/shim/eslint.mjs"),
          assert: path.join(dirname, "./docs-svelte-kit/shim/assert.mjs"),
          module: path.join(dirname, "./docs-svelte-kit/shim/module.mjs"),
          path: path.join(dirname, "./docs-svelte-kit/shim/path.mjs"),
          url: path.join(dirname, "./docs-svelte-kit/shim/url.mjs"),
          os: path.join(dirname, "./docs-svelte-kit/shim/os.mjs"),
        },
      },
      plugins: [
        svelteMd(
          svelteMdOption({
            baseUrl: "/eslint-plugin-svelte",
            root: path.join(dirname, "./docs"),
          }),
        ),
      ],
    },
  },
}
export default config
