"use strict"

/* !! This project can't be ESM yet, so hack it to get sveltekit to work. !! */
const esbuild = require("esbuild")
const path = require("path")

esbuild.buildSync({
  entryPoints: [require.resolve("./svelte.config.esm.mjs")],
  outfile: path.join(__dirname, "./svelte.config-dist.js"),
  format: "cjs",
  bundle: true,
  external: [
    "path",
    "cross-spawn",
    "prismjs",
    "./docs-svelte-kit/build-system/build.js",
  ],
})
const { register } = require("esbuild-register/dist/node")
register({
  format: "cjs",
  extensions: [".js", ".mjs", ".cjs", ".ts"],
})

/* eslint node/no-missing-require: 0 -- ignore */
const config = require("./svelte.config-dist.js").default

module.exports = config
