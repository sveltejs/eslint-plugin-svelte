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
derived(a, ($a) => {
	doSomethingWith($a);

	somethingWithACallback(() => {
		$a;
	});
});
derived(a, ($a) => {
	$a;

	somethingWithACallback(() => {
		// purposely shadow the var, this should not be updated
		const b = 303;
		b;
	});
});
derived([e, f], ([$e, h]) => {
	$e;
	h;

	somethingWithACallback(() => {
		$e;
		h;
	});
});
derived([e, f], ([$e, h]) => {
	$e;
	h;

	somethingWithACallback(() => {
		const g = 303;
		const h = 808;
		g;
		h;
	});
});
