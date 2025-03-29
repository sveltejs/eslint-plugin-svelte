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
derived(a, (b) => {
	doSomethingWith(b);

	somethingWithACallback(() => {
		b;
	});
});
derived(a, (b) => {
	b;

	somethingWithACallback(() => {
		// purposely shadow the var, this should not be updated
		const b = 303;
		b;
	});
});
derived([e, f], ([g, h]) => {
	g;
	h;

	somethingWithACallback(() => {
		g;
		h;
	});
});
derived([e, f], ([g, h]) => {
	g;
	h;

	somethingWithACallback(() => {
		const g = 303;
		const h = 808;
		g;
		h;
	});
});
derived(a, (b) => {
	// cause a conflict in names so the suggestion can't work
	const $a = 303;
	$a;
});
