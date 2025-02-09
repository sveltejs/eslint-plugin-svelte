<script>
	import { SvelteSet as CustomSet, SvelteMap as CustomMap } from 'svelte/reactivity';

	// These should be reported as unnecessary $state wrapping
	const set = $state(new CustomSet());
	const map = $state(new CustomMap());
</script>
