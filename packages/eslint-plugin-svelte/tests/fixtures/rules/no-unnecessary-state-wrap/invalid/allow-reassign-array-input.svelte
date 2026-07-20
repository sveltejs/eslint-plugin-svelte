<script>
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';

	// This should NOT be reported as unnecessary $state wrapping
	// because SvelteSet is in the allowReassign array and is reassigned
	let set = $state(new SvelteSet());
	set = new SvelteSet([1, 2, 3]);

	// This should be reported as unnecessary $state wrapping
	// because SvelteMap is not in the allowReassign array
	let map = $state(new SvelteMap());
	map = new SvelteMap();
</script>
