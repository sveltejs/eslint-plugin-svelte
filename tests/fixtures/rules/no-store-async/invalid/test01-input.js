import { writable, readable, derived } from 'svelte/store';

const w2 = writable(false, async () => {
	/** do nothing */
});
const r2 = readable(false, async () => {
	/** do nothing */
});
const d2 = derived(a1, async ($a1) => {
	/** do nothing */
});
