import ghpagesAdapter from "svelte-adapter-ghpages"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

// eslint-disable-next-line no-undef -- There seems to be a package that uses `self`.
if (typeof self === "undefined") {
  globalThis.self = globalThis
}

const dirname = path.dirname(fileURLToPath(import.meta.url))

// This project can't be ESM yet, so hack it to get svelte-kit to work.
// A hack that treats files in the `.svelte-kit` directory as ESM.
if (!fs.existsSync(path.join(dirname, ".svelte-kit"))) {
  fs.mkdirSync(path.join(dirname, ".svelte-kit"))
}
fs.writeFileSync(
  path.join(dirname, ".svelte-kit/package.json"),
  JSON.stringify({ type: "module" }),
)

const outDir = path.join(dirname, "build/eslint-plugin-svelte")

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
      pages: outDir,
      assets: outDir,
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
