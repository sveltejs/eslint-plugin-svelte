<script>
	import { SvelteSet } from 'svelte/reactivity';

	// Reported even when reassigned. No suggestion is offered because
	// removing $state would make the reassignment non-reactive.
	let set = $state(new SvelteSet());
	set = new SvelteSet([1, 2, 3]);

	// Not reassigned, so the suggestion is offered
	let set2 = $state(new SvelteSet());
</script>
