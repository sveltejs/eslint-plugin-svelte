import { writable, readable, derived } from "svelte/store"

const w1 = writable(false, () => {
  /** do nothing */
})
const r1 = readable(false, () => {
  /** do nothing */
})
const d1 = derived(a1, ($a1) => {
  /** do nothing */
})
