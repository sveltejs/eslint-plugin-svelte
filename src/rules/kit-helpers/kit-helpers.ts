import type { RuleContext } from "../../types"
import fs from "fs"
import path from "path"

const isRunOnBrowser = !fs.readFileSync

const projectRootPath = isRunOnBrowser ? "" : getProjectRootPath()

/**
 * return true if it's a Svelte Kit page component.
 * @param context
 * @returns
 */
export function isKitPageComponent(context: RuleContext): boolean {
  // Hack: if it runs on browser, it regards as Svelte Kit project.
  if (isRunOnBrowser) return true

  const routes =
    context.settings?.kit?.files?.routes?.replace(/^\//, "") ?? "src/routes"
  const filePath = context
    .getFilename()
    .replace(projectRootPath ?? "", "")
    .replace(/^\//, "")
  return filePath.startsWith(routes)
}

export const hasSvelteKit = (() => {
  // Hack: if it runs on browser, it regards as Svelte Kit project.
  if (isRunOnBrowser || !projectRootPath) return true
  try {
    const packageJson = readPackageJson(projectRootPath)
    if (!packageJson) return false
    if (packageJson.name === "eslint-plugin-svelte")
      // Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
      // So always it returns true if it runs on the package.
      return true
    return Boolean(
      packageJson.dependencies["@sveltejs/kit"] ??
        packageJson.devDependencies["@sveltejs/kit"],
    )
  } catch (_e) {
    return false
  }
})()

/**
 * refer: https://github.com/mysticatea/eslint-plugin-node/blob/f45c6149be7235c0f7422d1179c25726afeecd83/lib/util/get-package-json.js#L46-L75
 * @param startPath
 * @returns
 */
function getProjectRootPath(startPath = "a.js"): string | null {
  const startDir = path.dirname(path.resolve(startPath))
  let dir = startDir
  let prevDir = ""
  do {
    const filePath = path.join(dir, "package.json")
    if (fs.existsSync(filePath)) return dir
    prevDir = dir
    dir = path.resolve(dir, "..")
  } while (dir !== prevDir)
  return null
}

/**
 *
 * @param dir directory path
 * @returns JSON data of package.json or null
 */
function readPackageJson(dir: string): Record<string, any> | null {
  const filePath = path.join(dir, "package.json")
  try {
    const text = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(text)

    if (typeof data === "object" && data !== null) {
      data.filePath = filePath
      return data
    }
  } catch (_err) {
    // do nothing.
  }

  return null
}
