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
derived(null, ($null, set) => {
	/** do nothing */
});
derived(null, ($k, set) => {
	/** do nothing */
});
derived([null, l], ([$m, $l]) => {
	/** do nothing */
});
derived([n, null], ([$n, $o]) => {
	/** do nothing */
});
