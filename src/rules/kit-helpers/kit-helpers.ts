import type { RuleContext } from "../../types"
import fs from "fs"

/**
 * return true if it's a Svelte Kit page component.
 * @param context
 * @returns
 */
export function isKitPageComponent(context: RuleContext): boolean {
  // return false if it's not a Svelte Kit page component.
  const routes =
    context.settings?.kit?.files?.routes?.replace(/^\//, "") ?? "src/routes"
  const filePath = context
    .getFilename()
    .replace(context.getCwd?.() ?? "", "")
    .replace(/^\//, "")
  return filePath.startsWith(routes)
}

export const hasSvelteKit = (() => {
  // Hack: if it runs on browser, it regards as Svelte Kit project.
  if (!fs.readFileSync) return true
  try {
    const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"))
    // Hack: CI removes `@sveltejs/kit` and it returns false and test failed.
    // So always it returns true if it runs on the package.
    if (packageJson.name === "eslint-plugin-svelte") return true
    return Boolean(
      packageJson.dependencies["@sveltejs/kit"] ??
        packageJson.devDependencies["@sveltejs/kit"],
    )
  } catch (_e) {
    return false
  }
})()
