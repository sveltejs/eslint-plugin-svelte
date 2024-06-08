<script>
	import { derived } from 'svelte/store';
	const args = [[a, b], () => {}, false];
	const d = derived(...args);
</script>
