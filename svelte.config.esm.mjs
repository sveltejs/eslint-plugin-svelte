/* global __dirname, URL -- __dirname, URL */
import ghpagesAdapter from "svelte-adapter-ghpages"
import path from "path"

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
    prerender: {
      default: true,
    },
    files: {
      routes: path.join(dirname, "./docs"),
      template: path.join(dirname, "./docs-svelte-kit/src/app.html"),
      hooks: path.join(dirname, "./docs-svelte-kit/src/hooks"),
      lib: path.join(dirname, "./docs-svelte-kit/src/lib"),
      assets: path.join(dirname, "./docs-svelte-kit/statics"),
    },

    trailingSlash: "always",
  },
}
export default config
