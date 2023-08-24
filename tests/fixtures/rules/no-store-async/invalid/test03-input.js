import { writable as A, readable as B, derived as C } from 'svelte/store';

const w2 = A(false, async () => {
	/** do nothing */
});
const r2 = B(false, async () => {
	/** do nothing */
});
const d2 = C(a1, async ($a1) => {
	/** do nothing */
});
