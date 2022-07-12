import type { AST } from "svelte-eslint-parser"
import voidElements from "./void-elements.json"

/**
 * Returns name of SvelteElement
 */
export function getNodeName(node: AST.SvelteElement): string {
  return "name" in node.name ? node.name.name : node.name.property.name
}

/**
 * Returns true if Element is custom component
 */
export function isCustomComponent(node: AST.SvelteElement): boolean {
  return node.kind === "component"
}

/**
 * Returns true if element is known void element
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Empty_element}
 */
export function isVoidHtmlElement(node: AST.SvelteElement): boolean {
  return voidElements.includes(getNodeName(node))
}
