import type { AST } from "svelte-eslint-parser"
import voidElements from "./void-elements"

/**
 * Returns name of SvelteElement
 */
export function getNodeName(node: AST.SvelteElement): string {
  if ("name" in node.name) {
    return node.name.name
  }
  let object = ""
  let currentObject = node.name.object
  while ("object" in currentObject) {
    object = `${currentObject.property.name}.${object}`
    currentObject = currentObject.object
  }
  if ("name" in currentObject) {
    object = `${currentObject.name}.${object}`
  }
  return object + node.name.property.name
}

/**
 * Returns true if element is known void element
 * {@link https://developer.mozilla.org/en-US/docs/Glossary/Empty_element}
 */
export function isVoidHtmlElement(node: AST.SvelteElement): boolean {
  return voidElements.includes(getNodeName(node))
}
