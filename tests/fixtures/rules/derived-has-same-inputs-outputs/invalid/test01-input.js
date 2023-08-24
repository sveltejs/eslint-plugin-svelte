import { derived } from 'svelte/store';

derived(a, (b) => {
	/** do nothing */
});
derived(c, (d, set) => {
	/** do nothing */
});
derived([e, f], ([g, h]) => {
	/** do nothing */
});
derived([i, j], ([k, l], set) => {
	/** do nothing */
});
derived([null, l], ([$m, $n]) => {
	/** do nothing */
});
derived([o, null], ([$p, $q]) => {
	/** do nothing */
});
