<script>
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';

	// These should be reported as unnecessary $state wrapping
	// even with allowReassign: true because they are not reassigned
	const set = $state(new SvelteSet());
	let map = $state(new SvelteMap());
</script>
