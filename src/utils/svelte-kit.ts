/**
 * refer: https://github.com/mysticatea/eslint-plugin-node/blob/f45c6149be7235c0f7422d1179c25726afeecd83/lib/util/get-package-json.js
 */

import type { RuleContext } from "../types"
import fs from "fs"
import path from "path"
import { getPackageJson } from "./get-package-json"

const isRunOnBrowser = !fs.readFileSync

/**
 * return true if it's a Svelte Kit page component.
 * @param context
 * @returns
 */
export function isKitPageComponent(context: RuleContext): boolean {
  // Hack: if it runs on browser, it regards as Svelte Kit project.
  if (isRunOnBrowser) return true
  if (!hasSvelteKit(context.getFilename())) return false
  const routes =
    context.settings?.svelte?.kit?.files?.routes?.replace(/^\//, "") ??
    "src/routes"
  const filePath = context.getFilename()
  const projectRootDir = getProjectRootDir(context.getFilename()) ?? ""
  const fileName = filePath.split("/").pop() || filePath
  return (
    filePath.startsWith(path.join(projectRootDir, routes)) &&
    // MEMO: check only `+` and file extension for maintainability
    Boolean(/\+.+\.svelte/.test(fileName))
  )
}

/**
 * Check givin file is under SvelteKit project.
 *
 * If it runs on browser, it always returns true.
 *
 * @param filePath A file path.
 * @returns
 */
function hasSvelteKit(filePath: string): boolean {
  // Hack: if it runs on browser, it regards as Svelte Kit project.
  if (isRunOnBrowser) return true
  try {
    const packageJson = getPackageJson(filePath)
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
}

/**
 * Gets a  project root folder path.
 * @param filePath A file path to lookup.
 * @returns A found project root folder path or null.
 */
function getProjectRootDir(filePath: string): string | null {
  if (isRunOnBrowser) return null
  const packageJsonFilePath = getPackageJson(filePath)?.filePath
  if (!packageJsonFilePath) return null
  return path.dirname(path.resolve(packageJsonFilePath))
}
