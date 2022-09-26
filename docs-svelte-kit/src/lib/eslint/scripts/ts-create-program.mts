import type typescript from "typescript"
import type tsvfs from "@typescript/vfs"
type TS = typeof typescript
type TSVFS = typeof tsvfs

/** Create Program */
export function createProgram(
  {
    ts,
    compilerOptions,
    compilerHost,
  }: {
    ts: TS
    compilerOptions: typescript.CompilerOptions
    compilerHost: typescript.CompilerHost
  },
  options: { filePath: string },
): typescript.Program {
  try {
    const program = ts.createProgram({
      rootNames: [options.filePath],
      options: compilerOptions,
      host: compilerHost,
    })
    return program
  } catch (e) {
    // eslint-disable-next-line no-console -- Demo debug
    console.error(e)
    throw e
  }
}

export function createCompilerOptions(ts: TS): typescript.CompilerOptions {
  const compilerOptions: typescript.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.Preserve,
    strict: true,
  }
  compilerOptions.lib = [ts.getDefaultLibFileName(compilerOptions)]
  return compilerOptions
}

export async function createVirtualCompilerHost(
  {
    ts,
    tsvfs,
    compilerOptions,
  }: {
    ts: TS
    tsvfs: TSVFS
    compilerOptions: typescript.CompilerOptions
  },
  { filePath: targetFilePath }: { filePath: string },
): Promise<{
  compilerHost: typescript.CompilerHost
  updateFile: (sourceFile: typescript.SourceFile) => boolean
  fsMap: Map<string, string>
}> {
  const fsMap = await tsvfs.createDefaultMapFromCDN(
    {
      lib: Array.from(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- use internal
        (ts as any).libMap.keys(),
      ),
    },
    ts.version,
    true,
    ts,
  )
  const system = tsvfs.createSystem(fsMap)
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts)
  // eslint-disable-next-line @typescript-eslint/unbound-method -- backup original
  const original = { getSourceFile: host.compilerHost.getSourceFile }
  host.compilerHost.getSourceFile = function (
    fileName,
    languageVersionOrOptions,
    ...args
  ) {
    if (targetFilePath === fileName) {
      // Exclude the target file from caching as it will be modified.
      const file = this.readFile(fileName) ?? ""
      return ts.createSourceFile(fileName, file, languageVersionOrOptions, true)
    }
    if (this.fileExists(fileName)) {
      return original.getSourceFile.apply(this, [
        fileName,
        languageVersionOrOptions,
        ...args,
      ])
    }
    // Avoid error
    // eslint-disable-next-line no-console -- Demo debug
    console.log(`Not exists: ${fileName}`)
    return undefined
  }
  return {
    ...host,
    fsMap,
  }
}
