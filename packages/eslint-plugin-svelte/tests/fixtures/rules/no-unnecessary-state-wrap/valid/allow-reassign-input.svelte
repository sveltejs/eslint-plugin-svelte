<script>
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';

	// These should be allowed when allowReassign is true and variables are reassigned
	let set = $state(new SvelteSet());
	set = new SvelteSet([1, 2, 3]);

	let map = $state(new SvelteMap());
	map = new SvelteMap([['key', 'value']]);
</script>
