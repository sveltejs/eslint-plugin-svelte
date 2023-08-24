import * as stores from 'svelte/store';

const w2 = stores.writable(false, async () => {
	/** do nothing */
});
const r2 = stores.readable(false, async () => {
	/** do nothing */
});
const d2 = stores.derived(a1, async ($a1) => {
	/** do nothing */
});
