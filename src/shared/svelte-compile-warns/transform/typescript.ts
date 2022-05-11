import type { AST } from "svelte-eslint-parser"
import Module from "module"
import path from "path"
import type typescript from "typescript"
import type { RuleContext } from "../../../types"
import type { TransformResult } from "./types"

type TS = typeof typescript
const cacheTs = new WeakMap<AST.SvelteProgram, TS>()
/**
 * Transpile with typescript
 */
export function transform(
  node: AST.SvelteScriptElement,
  context: RuleContext,
): TransformResult | null {
  const ts = loadTs(context)
  if (!ts) {
    return null
  }
  let inputRange: AST.Range
  if (node.endTag) {
    inputRange = [node.startTag.range[1], node.endTag.range[0]]
  } else {
    inputRange = [node.startTag.range[1], node.range[1]]
  }
  const code = context.getSourceCode().text.slice(...inputRange)

  const output = ts.transpileModule(code, {
    reportDiagnostics: false,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
      sourceMap: true,
    },
  })

  return {
    inputRange,
    output: output.outputText,
    mappings: JSON.parse(output.sourceMapText!).mappings,
  }
}

/**
 * Load typescript
 */
function loadTs(context: RuleContext) {
  const key = context.getSourceCode().ast
  const ts = cacheTs.get(key)
  if (ts) {
    return ts
  }
  try {
    const createRequire: (filename: string) => (modName: string) => unknown =
      // Added in v12.2.0
      Module.createRequire ||
      // Added in v10.12.0, but deprecated in v12.2.0.
      // @ts-expect-error -- old type
      Module.createRequireFromPath

    const cwd = context.getCwd?.() ?? process.cwd()
    const relativeTo = path.join(cwd, "__placeholder__.js")
    const ts = createRequire(relativeTo)("typescript") as TS
    cacheTs.set(key, ts)
    return ts
  } catch {
    return null
  }
}
