/* !! This project can't be ESM yet, so hack it to get sveltekit to work. !! */
import babelCore from "@babel/core"
import * as t from "@babel/types"

import pirates from "pirates"

pirates.addHook(transform, {
  exts: [".js", ".mjs"],
})

/** transform code */
function transform(code, _filename) {
  if (code.includes("import(")) {
    let transformed = false
    const newCode = babelCore.transformSync(code, {
      babelrc: false,
      plugins: [
        {
          visitor: {
            CallExpression(path) {
              const callee = path.get("callee")
              if (callee.type === "Import") {
                callee.replaceWith(t.identifier("$$$import"))
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
    return `${newCode.code}
async function $$$import(module, ...args) {
  const m = await import(module)
  return ________adjustModule(m)
}
function ________adjustModule(m) {
  const keys = Object.keys(m);
  if(m.default && keys.length === 1 && keys[0] === 'default' && typeof m.default === 'object') {
    const result = {
      default: ________adjustModule(m.default)
    }
    for (const key of Object.keys(m.default)) {
      result[key] = m.default[key]
    }
    return result
  }
  return m
}
`
  }

  return code
}

/**
 * @param {string} url
 * @param {{
 *   format: string,
 * }} context If resolve settled with a `format`, that value is included here.
 * @param {Function} defaultLoad
 * @returns {Promise<{
 * format: !string,
 * source: !(string | ArrayBuffer | SharedArrayBuffer | Uint8Array),
 * }>}
 */
export async function load(url, context, defaultLoad) {
  const result = await defaultLoad(url, context, defaultLoad)
  return {
    format: result.format,
    source: transform(`${result.source}`),
  }
}

/**
 * @param {!(string | SharedArrayBuffer | Uint8Array)} source
 * @param {{
 *   format: string,
 *   url: string,
 * }} context
 * @param {Function} defaultTransformSource
 * @returns {Promise<{ source: !(string | SharedArrayBuffer | Uint8Array) }>}
 */
export async function transformSource(source, context, defaultTransformSource) {
  const result = await defaultTransformSource(
    source,
    context,
    defaultTransformSource,
  )
  return {
    source: transform(`${result.source}`),
  }
}
