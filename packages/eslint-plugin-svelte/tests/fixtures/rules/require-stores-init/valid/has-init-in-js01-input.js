import { writable, readable, derived } from 'svelte/store';
export const w = writable(false);
export const r = readable({});
export const d = derived([a, b], () => {}, false);
