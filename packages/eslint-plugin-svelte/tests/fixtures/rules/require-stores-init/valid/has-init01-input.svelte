<script>
	import { writable, readable, derived } from 'svelte/store';
	const w = writable(false);
	const r = readable({});
	const d = derived([a, b], () => {}, false);
</script>
