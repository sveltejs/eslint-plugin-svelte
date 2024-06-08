import { writable, readable, derived } from 'svelte/store';

const w1 = writable(false, () => {
	/** do nothing */
});
const w2 = writable(false);
const r1 = readable(false, () => {
	/** do nothing */
});
const r2 = readable(false);
const d1 = derived(a1, ($a1) => {
	/** do nothing */
});
const d2 = derived(a1);
