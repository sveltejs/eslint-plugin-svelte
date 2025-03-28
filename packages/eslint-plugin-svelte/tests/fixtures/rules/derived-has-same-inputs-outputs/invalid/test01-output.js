import { derived } from 'svelte/store';

derived(a, ($a) => {
	/** do nothing */
});
derived(c, ($c, set) => {
	/** do nothing */
});
derived([e, f], ([$e, $f]) => {
	/** do nothing */
});
derived([i, j], ([$i, $j], set) => {
	/** do nothing */
});
derived([null, l], ([$m, $l]) => {
	/** do nothing */
});
derived([o, null], ([$o, $q]) => {
	/** do nothing */
});
