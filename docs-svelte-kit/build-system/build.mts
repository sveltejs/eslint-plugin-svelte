import esbuild from "esbuild"
import path from "path"
import fs from "fs"
// const babelCore = require("@babel/core")
// const t = require("@babel/types")

const dirname = path.dirname(
  new URL(
    // @ts-expect-error -- Cannot change `module` option
    import.meta.url,
  ).pathname,
)

build(
  path.join(dirname, "./src/eslint.mjs"),
  path.join(dirname, "../shim/eslint.mjs"),
  ["assert", "util"],
)
build(
  path.join(dirname, "../../node_modules/assert"),
  path.join(dirname, "../shim/assert.mjs"),
)

/** build */
function build(input: string, out: string, injects: string[] = []) {
  // eslint-disable-next-line no-console -- ignore
  console.log(`build@ ${input}`)
  let code = bundle(input, ["path", ...injects])
  code = transform(code, ["path", ...injects])
  fs.writeFileSync(out, code, "utf8")
}

/** bundle */
function bundle(entryPoint: string, externals: string[]) {
  const result = esbuild.buildSync({
    entryPoints: [entryPoint],
    format: "esm",
    bundle: true,
    external: externals,
    write: false,
    inject: [path.join(dirname, "./src/process-shim.mjs")],
  })

  return `${result.outputFiles[0].text}`
}

/** transform code */
function transform(code: string, injects: string[]) {
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
