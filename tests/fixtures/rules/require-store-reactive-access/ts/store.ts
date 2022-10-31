import { writable, readable, derived } from "svelte/store"
export const wStore = writable(0)
export const rStore = readable(0)
export const dStore = derived(wStore, () => {
  //
})
