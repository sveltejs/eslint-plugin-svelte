import { writable, readable, derived } from 'svelte/store';

const w2 = writable(false, async function () {
	/** do nothing */
});
const r2 = readable(false, async function () {
	/** do nothing */
});
const d2 = derived(a1, async function ($a1) {
	/** do nothing */
});
