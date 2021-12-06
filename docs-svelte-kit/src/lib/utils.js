// eslint-disable-next-line node/file-extension-in-import -- ignore
import { rules } from "../../../src/utils/rules.ts"
import { readable, writable } from "svelte/store"
// eslint-disable-next-line node/no-missing-import -- ignore
import { page } from "$app/stores"

const svelteRules = rules.filter((rule) => !rule.meta.deprecated)

const categories = [
  "Possible Errors",
  "Security Vulnerability",
  "Best Practices",
  "Stylistic Issues",
  "Extension Rules",
  "System",
]
svelteRules.forEach((rule) => {
  if (!categories.includes(rule.meta.docs.category)) {
    throw new Error(`missing categories:${rule.meta.docs.category}`)
  }
})

const categoryRules = categories.map((cat) => {
  return {
    title: cat,
    children: svelteRules
      .filter((rule) => rule.meta.docs.category === cat)
      .map((rule) => {
        return {
          title: rule.meta.docs.ruleId,
          path: `/rules/${rule.meta.docs.ruleName}/`,
        }
      }),
  }
})
const SIDE_MENU = {
  "/rules": [
    { path: "/", title: "Introduction" },
    { path: "/user-guide/", title: "User Guide" },
    {
      path: "/rules/",
      title: "Available Rules",
      children: categoryRules,
    },
    { path: "/playground/", title: "Playground" },
  ],
  "/": [
    { path: "/", title: "Introduction" },
    { path: "/user-guide/", title: "User Guide" },
    { path: "/rules/", title: "Available Rules" },
    { path: "/playground/", title: "Playground" },
  ],
}

export function isActive(path, $page) {
  return normalizePath($page.path) === normalizePath(path)
}

export function normalizePath(path) {
  return path === "/" ? "/README" : path
}

export const tocStore = writable([])

export const menuItems = readable([], function start(set) {
  let pageData = {}
  let tocData = { children: [] }
  const pageUnsubscriber = page.subscribe(($page) => {
    pageData = $page
    set(generateMenu(pageData, tocData))
  })
  const tocUnsubscriber = tocStore.subscribe((toc) => {
    tocData = toc
    set(generateMenu(pageData, tocData))
  })

  return function stop() {
    pageUnsubscriber()
    tocUnsubscriber()
  }
})

function generateMenu($page, toc) {
  const result = []
  const [, menus] =
    Object.entries(SIDE_MENU).find(([k]) => $page.path.startsWith(k)) ||
    SIDE_MENU["/"]
  for (const { path, title, children } of menus) {
    const active = isActive(path, $page)
    if (active) {
      for (const item of toc.children) {
        result.push({
          ...item,
          path,
          title,
          children: children || item.children,
        })
      }
    } else {
      result.push({ path, title, children })
    }
  }

  return result
}
