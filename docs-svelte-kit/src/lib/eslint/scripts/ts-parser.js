import { loadMonacoEngine } from "./monaco-loader"
import {
  createProgram,
  createCompilerOptions,
  createVirtualCompilerHost,
} from "./ts-create-program.mts"

let tsParserCache = null
export function loadTsParser() {
  return (tsParserCache ??= loadTsParserImpl())
}

async function loadTsParserImpl() {
  await loadMonacoEngine()
  const [ts, tsvfs, tsParser] = await Promise.all([
    import("typescript"),
    import("@typescript/vfs"),
    import("@typescript-eslint/parser"),
  ])
  if (typeof window === "undefined") {
    return tsParser
  }
  window.define("typescript", ts)

  const compilerOptions = createCompilerOptions(ts)
  const filePath = "/demo.ts"
  const host = await createVirtualCompilerHost(
    { ts, tsvfs, compilerOptions },
    { filePath },
  )
  return {
    parseForESLint(code, options) {
      host.fsMap.set(filePath, code)
      // Requires its own Program instance to provide full type information.
      const program = createProgram(
        { ts, compilerHost: host.compilerHost, compilerOptions },
        { filePath },
      )

      try {
        const result = tsParser.parseForESLint(code, {
          ...options,
          filePath: filePath.replace(/^\//u, ""),
          programs: [program],
        })
        return result
      } catch (e) {
        // eslint-disable-next-line no-console -- Demo debug
        console.error(e)
        throw e
      }
    },
  }
}
