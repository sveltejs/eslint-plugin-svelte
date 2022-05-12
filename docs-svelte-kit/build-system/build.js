const esbuild = require("esbuild")
const path = require("path")
const fs = require("fs")
// const babelCore = require("@babel/core")
// const t = require("@babel/types")

build(
  require.resolve("./src/eslint.mjs"),
  path.join(__dirname, "../shim/eslint.mjs"),
  ["assert"],
)
build(
  require.resolve("../../node_modules/assert"),
  path.join(__dirname, "../shim/assert.mjs"),
)

/** build */
function build(input, out, injects = []) {
  console.log(`build@ ${input}`)
  let code = bundle(input, ["path", ...injects])
  code = transform(code, ["path", ...injects])
  fs.writeFileSync(out, code, "utf8")
}

/** bundle */
function bundle(entryPoint, externals) {
  const result = esbuild.buildSync({
    entryPoints: [entryPoint],
    format: "esm",
    bundle: true,
    external: externals,
    write: false,
    inject: [require.resolve("./src/process-shim.mjs")],
  })

  return `${result.outputFiles[0].text}`
}

/** transform code */
function transform(code, injects) {
  const newCode = code.replace(/"[a-z]+" = "[a-z]+";/, "")
  // const newCode = babelCore.transformSync(code, {
  //   babelrc: false,
  //   plugins: [
  //     {
  //       visitor: {
  //         CallExpression(path) {
  //           const callee = path.get("callee")
  //           if (
  //             callee.type === "Identifier" &&
  //             callee.node.name === "__require"
  //           ) {
  //             callee.replaceWith(t.identifier("__$$$require"))
  //           }
  //         },
  //       },
  //     },
  //   ],
  // })
  return `
${injects
  .map(
    (inject) =>
      `import $inject_${inject.replace(/-/g, "_")}$ from '${inject}';`,
  )
  .join("\n")}
const $_injects_$ = {${injects
    .map((inject) => `${inject.replace(/-/g, "_")}:$inject_${inject}$`)
    .join(",\n")}};
function require(module, ...args) {
  return $_injects_$[module] || {}
}
${newCode}
`
}
