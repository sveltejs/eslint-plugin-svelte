<script>
	import { SvelteSet, SvelteMap, SvelteDate } from 'svelte/reactivity';
	import Child from './Child.svelte';

	// Reassigned variables are allowed by default
	let set = $state(new SvelteSet());
	set = new SvelteSet([1, 2, 3]);

	let map = $state(new SvelteMap());
	function reset() {
		map = new SvelteMap([['key', 'value']]);
	}

	let date = $state(new SvelteDate());

	let bound = $state(new SvelteSet());
</script>

<button onclick={() => (date = new SvelteDate())}>reset</button>
<Child bind:bound />
