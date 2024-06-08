<script>
	import { writable, readable, derived } from 'svelte/store';
	const w = writable();
	const r = readable();
	const d = derived([a, b], () => {});
</script>
