import type { AST } from "svelte-eslint-parser"
import voidElements from "./void-elements.json"

/**
 *
 */
export function getNodeName(node: AST.SvelteElement): string {
  return "name" in node.name ? node.name.name : node.name.property.name
}

/**
 *
 */
export function isCustomComponent(node: AST.SvelteElement): boolean {
  return node.kind === "component"
}

/**
 *
 */
export function isVoidHtmlElement(node: AST.SvelteElement): boolean {
  return voidElements.includes(getNodeName(node))
}
