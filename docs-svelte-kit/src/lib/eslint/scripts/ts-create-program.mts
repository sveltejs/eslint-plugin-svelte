import type typescript from "typescript"
import type tsvfs from "@typescript/vfs"
import path from "path"
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

  // Setup svelte type definition modules
  for (const [key, get] of Object.entries(
    // @ts-expect-error -- ignore
    import.meta.glob("../../../../../node_modules/svelte/**/*.d.ts", {
      as: "raw",
    }),
  )) {
    const modulePath = key.slice("../../../../..".length)

    fsMap.set(
      modulePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ignore
      await (get as any)(),
    )
  }

  const system = tsvfs.createSystem(fsMap)
  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts)
  const original = {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- backup original
    getSourceFile: host.compilerHost.getSourceFile,
  }
  host.compilerHost.resolveModuleNames = function (
    moduleNames,
    containingFile,
  ) {
    return moduleNames.map((m) => {
      const targetPaths: string[] = []
      if (m.startsWith(".")) {
        targetPaths.push(path.join(path.dirname(containingFile), m))
      } else {
        targetPaths.push(`/node_modules/${m}`)
      }
      for (const modulePath of targetPaths.flatMap((m) => [
        `${m}.d.ts`,
        `${m}.ts`,
        `${m}/index.d.ts`,
        `${m}/index.ts`,
      ])) {
        if (fsMap.has(modulePath)) {
          return { resolvedFileName: modulePath }
        }
      }
      return undefined
    })
  }
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
