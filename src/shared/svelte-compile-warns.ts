import type { AST } from "svelte-eslint-parser"
import Module from "module"
import path from "path"
import * as compiler from "svelte/compiler"
import type typescript from "typescript"
import type { SourceMapMappings } from "sourcemap-codec"
import { decode } from "sourcemap-codec"
import type { RuleContext } from "../types"
import { LinesAndColumns } from "../utils/lines-and-columns"

export type Loc = {
  start?: {
    line: number
    column: number
  }
  end?: {
    line: number
    column: number
  }
}
export type Warning = {
  code?: string
  message: string
} & Loc
export type GetSvelteWarningsOption = {
  warnings: "ignoreWarnings" | "onlyWarnings" | null
  removeComments?: Iterable<AST.Token | AST.Comment>
}

/**
 * Get svelte compile warnings
 */
export function getSvelteCompileWarnings(
  context: RuleContext,
  option: GetSvelteWarningsOption,
): Warning[] | null {
  const sourceCode = context.getSourceCode()

  const text = buildStrippedText(context, option)

  if (!context.parserServices.esTreeNodeToTSNodeMap) {
    return getWarningsFromCode(text, option)
  }

  let ts: TS
  try {
    const createRequire: (filename: string) => (modName: string) => unknown =
      // Added in v12.2.0
      Module.createRequire ||
      // Added in v10.12.0, but deprecated in v12.2.0.
      // @ts-expect-error -- old type
      Module.createRequireFromPath

    const cwd = context.getCwd?.() ?? process.cwd()
    const relativeTo = path.join(cwd, "__placeholder__.js")
    ts = createRequire(relativeTo)("typescript") as TS
  } catch {
    return []
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
          outputLocs = outputLocs ?? new LinesAndColumns(outputText)
          inputLocs = inputLocs ?? new LinesAndColumns(inputText)
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
        decoded = decoded ?? decode(JSON.parse(output.sourceMapText!).mappings)

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
      const locs = (this.locs = this.locs ?? new LinesAndColumns(this.code))
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

  const root = sourceCode.ast

  for (const node of root.body) {
    if (node.type === "SvelteScriptElement") {
      if (node.endTag) {
        remapContext.appendOriginal(node.startTag.range[1])
        remapContext.appendTranspile(node.endTag.range[0])
      }
    }
  }
  const code = remapContext.postprocess()
  const baseWarnings = getWarningsFromCode(code, option)
  if (!baseWarnings) {
    return null
  }

  const warnings: Warning[] = []
  for (const warn of baseWarnings) {
    let loc: Loc | null = null

    /** Get re-mapped location */
    // eslint-disable-next-line func-style -- ignore
    const getLoc = function getLoc() {
      if (loc) {
        return loc
      }
      return (loc = remapContext.remapLocs(warn))
    }

    warnings.push({
      code: warn.code,
      message: warn.message,
      get start() {
        return getLoc().start
      },
      get end() {
        return getLoc().end
      },
    })
  }

  return warnings
}

/**
 * Extracts the style with the lang attribute other than CSS.
 */
export function* extractStyleElementsWithLangOtherThanCSS(
  context: RuleContext,
): Iterable<AST.SvelteStyleElement> {
  const sourceCode = context.getSourceCode()
  const root = sourceCode.ast
  for (const node of root.body) {
    if (node.type === "SvelteStyleElement") {
      const langAttr = node.startTag.attributes.find(
        (attr): attr is AST.SvelteAttribute =>
          attr.type === "SvelteAttribute" && attr.key.name === "lang",
      )
      if (
        langAttr &&
        langAttr.value.length === 1 &&
        langAttr.value[0].type === "SvelteLiteral" &&
        langAttr.value[0].value.toLowerCase() !== "css"
      ) {
        yield node
      }
    }
  }
}

/**
 * Build the text stripped of tokens that are not needed for compilation.
 */
function buildStrippedText(
  context: RuleContext,
  option: GetSvelteWarningsOption,
) {
  const sourceCode = context.getSourceCode()
  const baseText = sourceCode.text

  const removeTokens: (AST.Token | AST.Comment | AST.SvelteText)[] =
    option.removeComments ? [...option.removeComments] : []

  // Strips the style with the lang attribute other than CSS.
  for (const node of extractStyleElementsWithLangOtherThanCSS(context)) {
    removeTokens.push(...node.children)
  }
  if (!removeTokens.length) {
    return baseText
  }

  removeTokens.sort((a, b) => a.range[0] - b.range[0])

  let code = ""
  let start = 0
  for (const token of removeTokens) {
    code +=
      baseText.slice(start, token.range[0]) +
      baseText.slice(...token.range).replace(/[^\t\n\r ]/g, " ")
    start = token.range[1]
  }
  code += baseText.slice(start)
  return code
}

type TS = typeof typescript

/**
 * Get compile warnings
 */
function getWarningsFromCode(
  code: string,
  { warnings }: GetSvelteWarningsOption,
): Warning[] | null {
  const ignoreWarnings = warnings === "ignoreWarnings"
  const onlyWarnings = warnings === "onlyWarnings"
  try {
    const result = compiler.compile(code, {
      generate: false,
    })

    if (ignoreWarnings) {
      return []
    }
    return result.warnings as Warning[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
  } catch (e: any) {
    if (onlyWarnings) {
      return null
    }
    // console.log(code)
    if (!ignoreWarnings) {
      try {
        const result = compiler.compile(code, {
          generate: false,
          errorMode: "warn",
        })
        return result.warnings as Warning[]
      } catch {
        // ignore
      }
    }
    return [
      {
        code: e.code,
        message: e.message,
        start: e.start,
        end: e.end,
      },
    ]
  }
}