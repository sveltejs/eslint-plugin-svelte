import Module from "module"
import path from "path"
import { VisitorKeys } from "svelte-eslint-parser"
import type { SourceCode } from "../types"
import { createRule } from "../utils"
import * as compiler from "svelte/compiler"
import type typescript from "typescript"
import type { SourceMapMappings } from "sourcemap-codec"
import { decode } from "sourcemap-codec"

type TS = typeof typescript

type Warning = {
  code?: string
  start?: {
    line: number
    column: number
  }
  end?: {
    line: number
    column: number
  }
  message: string
}

class LinesAndColumns {
  private readonly lineStartIndices: number[]

  public constructor(code: string) {
    const len = code.length
    const lineStartIndices = [0]
    for (let index = 0; index < len; index++) {
      const c = code[index]
      if (c === "\r") {
        const next = code[index + 1] || ""
        if (next === "\n") {
          index++
        }
        lineStartIndices.push(index + 1)
      } else if (c === "\n") {
        lineStartIndices.push(index + 1)
      }
    }
    this.lineStartIndices = lineStartIndices
  }

  public getLocFromIndex(index: number): { line: number; column: number } {
    const lineNumber = sortedLastIndex(this.lineStartIndices, index)
    return {
      line: lineNumber,
      column: index - this.lineStartIndices[lineNumber - 1],
    }
  }

  public getIndexFromLoc(loc: { line: number; column: number }): number {
    const lineStartIndex = this.lineStartIndices[loc.line - 1]
    const positionIndex = lineStartIndex + loc.column

    return positionIndex
  }
}

export default createRule("valid-compile", {
  meta: {
    docs: {
      description: "disallow warnings when compiling.",
      category: "Possible Errors",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreWarnings: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {},
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isSvelte) {
      return {}
    }
    const ignoreWarnings = Boolean(context.options[0]?.ignoreWarnings)
    const sourceCode = context.getSourceCode()
    const text = sourceCode.text

    const ignores = ["missing-declaration"]

    /**
     * report
     */
    function report(
      warnings: Warning[],
      mapLocation?: (warn: Warning) => {
        start?: {
          line: number
          column: number
        }
        end?: {
          line: number
          column: number
        }
      },
    ) {
      for (const warn of warnings) {
        if (warn.code && ignores.includes(warn.code)) {
          continue
        }
        const loc = mapLocation?.(warn) ?? warn
        context.report({
          loc: {
            start: loc.start || loc.end || { line: 1, column: 0 },
            end: loc.end || loc.start || { line: 1, column: 0 },
          },
          message: `${warn.message}${warn.code ? `(${warn.code})` : ""}`,
        })
      }
    }

    const parserVisitorKeys = sourceCode.visitorKeys
    if (isEqualKeys(parserVisitorKeys, VisitorKeys)) {
      return {
        "Program:exit"() {
          report(getWarnings(text))
        },
      }
    }
    let ts: TS
    try {
      const createRequire: (filename: string) => (modName: string) => unknown =
        // Added in v12.2.0
        Module.createRequire ||
        // Added in v10.12.0, but deprecated in v12.2.0.
        Module.createRequireFromPath

      const cwd = context.getCwd?.() ?? process.cwd()
      const relativeTo = path.join(cwd, "__placeholder__.js")
      ts = createRequire(relativeTo)("typescript") as TS
    } catch {
      return {}
    }

    class RemapContext {
      private originalStart = 0

      private code = ""

      private locs: LinesAndColumns | null = null

      private readonly mapIndexes: {
        range: [number, number]
        remap: (index: number) => number
      }[] = []

      public appendOriginal(endIndex: number) {
        const codeStart = this.code.length
        const start = this.originalStart
        this.code += text.slice(start, endIndex)
        this.originalStart = endIndex
        const offset = start - codeStart
        this.mapIndexes.push({
          range: [codeStart, this.code.length],
          remap(index) {
            return index + offset
          },
        })
      }

      public postprocess(): string {
        this.appendOriginal(text.length)
        return this.code
      }

      public appendTranspile(endIndex: number) {
        const codeStart = this.code.length
        const start = this.originalStart
        const inputText = text.slice(start, endIndex)

        const output = ts.transpileModule(inputText, {
          reportDiagnostics: false,
          compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Preserve,
            sourceMap: true,
          },
          transformers: {
            before: [createTsImportTransformer(ts)],
          },
        })

        const outputText = `${output.outputText}\n`

        this.code += outputText
        this.originalStart = endIndex

        let outputLocs: LinesAndColumns | null = null
        let inputLocs: LinesAndColumns | null = null
        let decoded: SourceMapMappings | null = null
        this.mapIndexes.push({
          range: [codeStart, this.code.length],
          remap: (index) => {
            outputLocs ??= new LinesAndColumns(outputText)
            inputLocs ??= new LinesAndColumns(inputText)
            const outputCodePos = outputLocs.getLocFromIndex(index - codeStart)
            const inputCodePos = remapPosition(outputCodePos)
            return inputLocs.getIndexFromLoc(inputCodePos) + start
          },
        })

        /** Remapping source position */
        function remapPosition(pos: { line: number; column: number }): {
          line: number
          column: number
        } {
          decoded ??= decode(JSON.parse(output.sourceMapText!).mappings)

          const lineMaps = decoded[pos.line - 1]

          if (!lineMaps?.length) {
            for (let line = pos.line - 1; line >= 0; line--) {
              const prevLineMaps = decoded[line]
              if (prevLineMaps?.length) {
                const [, , sourceCodeLine, sourceCodeColumn] =
                  prevLineMaps[prevLineMaps.length - 1]
                return {
                  line: sourceCodeLine! + 1,
                  column: sourceCodeColumn!,
                }
              }
            }
            return { line: -1, column: -1 }
          }

          for (let index = 0; index < lineMaps.length - 1; index++) {
            const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] =
              lineMaps[index]
            if (
              generateCodeColumn <= pos.column &&
              pos.column < lineMaps[index + 1][0]
            ) {
              return {
                line: sourceCodeLine! + 1,
                column: sourceCodeColumn! + (pos.column - generateCodeColumn),
              }
            }
          }
          const [generateCodeColumn, , sourceCodeLine, sourceCodeColumn] =
            lineMaps[lineMaps.length - 1]
          return {
            line: sourceCodeLine! + 1,
            column: sourceCodeColumn! + (pos.column - generateCodeColumn),
          }
        }
      }

      public remapLocs(points: {
        start?: {
          line: number
          column: number
        }
        end?: {
          line: number
          column: number
        }
      }): {
        start?: {
          line: number
          column: number
        }
        end?: {
          line: number
          column: number
        }
      } {
        const mapIndexes = this.mapIndexes
        const locs = (this.locs ??= new LinesAndColumns(this.code))
        let start:
          | {
              line: number
              column: number
            }
          | undefined = undefined
        let end:
          | {
              line: number
              column: number
            }
          | undefined = undefined
        if (points.start) {
          const index = locs.getIndexFromLoc(points.start)
          const remapped = remapIndex(index)
          if (remapped) {
            start = sourceCode.getLocFromIndex(remapped)
          }
        }
        if (points.end) {
          const index = locs.getIndexFromLoc(points.end)
          const remapped = remapIndex(index - 1 /* include index */)
          if (remapped) {
            end = sourceCode.getLocFromIndex(remapped + 1 /* restore */)
          }
        }

        return { start, end }

        /** remap index */
        function remapIndex(index: number) {
          for (const mapIndex of mapIndexes) {
            if (mapIndex.range[0] <= index && index < mapIndex.range[1]) {
              return mapIndex.remap(index)
            }
          }
          return null
        }
      }
    }

    const remapContext = new RemapContext()

    return {
      SvelteScriptElement(node) {
        if (node.endTag) {
          remapContext.appendOriginal(node.startTag.range[1])
          remapContext.appendTranspile(node.endTag.range[0])
        }
      },
      "Program:exit"() {
        const code = remapContext.postprocess()
        report(getWarnings(code), (warn) => remapContext.remapLocs(warn))
      },
    }

    /**
     * Get compile warnings
     */
    function getWarnings(code: string): Warning[] {
      try {
        const result = compiler.compile(code, { generate: false })

        if (ignoreWarnings) {
          return []
        }
        return result.warnings
      } catch (e) {
        // console.log(code)
        return [
          {
            message: e.message,
            start: e.start,
            end: e.end,
          },
        ]
      }
    }
  },
})

/**
 * Checks if the given visitorKeys are the equals.
 */
function isEqualKeys(
  a: SourceCode["visitorKeys"],
  b: SourceCode["visitorKeys"],
): boolean {
  const keysA = new Set(Object.keys(a))
  const keysB = new Set(Object.keys(a))
  if (keysA.size !== keysB.size) {
    return false
  }
  for (const key of keysA) {
    if (!keysB.has(key)) {
      return false
    }
    const vKeysA = new Set(a[key])
    const vKeysB = new Set(b[key])
    if (vKeysA.size !== vKeysB.size) {
      return false
    }

    for (const vKey of vKeysA) {
      if (!vKeysB.has(vKey)) {
        return false
      }
    }
  }
  return true
}

/**
 * @see https://github.com/sveltejs/eslint-plugin-svelte3/blob/259263ccaf69c59e473d9bfa39706b0955eccfbd/src/preprocess.js#L194
 * MIT License @ Conduitry
 */
function createTsImportTransformer(
  ts: TS,
): typescript.TransformerFactory<typescript.SourceFile> {
  const factory = ts.factory
  /**
   * https://github.com/sveltejs/svelte-preprocess/blob/main/src/transformers/typescript.ts
   * TypeScript transformer for preserving imports correctly when preprocessing TypeScript files
   */
  return (context: typescript.TransformationContext) => {
    /** visitor */
    function visit(node: typescript.Node): typescript.Node {
      if (ts.isImportDeclaration(node)) {
        if (node.importClause && node.importClause.isTypeOnly) {
          return factory.createEmptyStatement()
        }

        return factory.createImportDeclaration(
          node.decorators,
          node.modifiers,
          node.importClause,
          node.moduleSpecifier,
        )
      }

      return ts.visitEachChild(node, (child) => visit(child), context)
    }

    return (node: typescript.SourceFile) => ts.visitNode(node, visit)
  }
}

/**
 * Uses a binary search to determine the highest index at which value should be inserted into array in order to maintain its sort order.
 */
function sortedLastIndex(array: number[], value: number): number {
  let lower = 0
  let upper = array.length

  while (lower < upper) {
    const mid = Math.floor(lower + (upper - lower) / 2)
    const target = array[mid]
    if (target < value) {
      lower = mid + 1
    } else if (target > value) {
      upper = mid
    } else {
      return mid + 1
    }
  }

  return upper
}
