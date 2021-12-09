"use strict"

/* !! This project can't be ESM yet, so hack it to get sveltekit to work. !! */
const esbuild = require("esbuild")
const path = require("path")
const babelCore = require("@babel/core")
const pirates = require("pirates")

/* Build config */
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

/* transpile */
const { register } = require("esbuild-register/dist/node")
register({
  format: "cjs",
  extensions: [".js", ".mjs", ".cjs", ".ts"],
})

/** transform '@sveltejs/kit/ssr' path */
pirates.addHook(transformImportSsr, {
  exts: [".js", ".mjs"],
})

function transformImportSsr(code, _filename) {
  if (code.includes("@sveltejs/kit/ssr")) {
    const resolvedPath = require.resolve(
      "./node_modules/@sveltejs/kit/dist/ssr",
    )
    let transformed = false
    const newCode = babelCore.transformSync(code, {
      babelrc: false,
      plugins: [
        {
          visitor: {
            CallExpression(path) {
              const callee = path.get("callee")
              if (
                callee.type !== "Identifier" ||
                callee.node.name !== "require"
              ) {
                return
              }
              const args = path.get("arguments")
              if (args.length !== 1) {
                return
              }
              const arg = args[0]
              if (
                arg.type === "StringLiteral" &&
                arg.node.value === "@sveltejs/kit/ssr"
              ) {
                arg.node.value = resolvedPath
                transformed = true
              }
            },
            ImportDeclaration(path) {
              if (path.node.source.value === "@sveltejs/kit/ssr") {
                path.node.source.value = resolvedPath
                transformed = true
              }
            },
          },
        },
      ],
    })
    if (!transformed) {
      return code
    }
    return `${newCode.code}`
  }

  return code
}

/* eslint node/no-missing-require: 0 -- ignore */
const config = require("./svelte.config-dist.js").default

module.exports = config
