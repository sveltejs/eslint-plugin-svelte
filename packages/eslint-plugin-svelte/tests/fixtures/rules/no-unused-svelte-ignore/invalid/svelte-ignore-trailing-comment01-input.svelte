<script>
	import { setContext } from 'svelte';
	let { value } = $props();
	setContext('probe', {
		x: 1, // svelte-ignore state_referenced_locally
		value
	});
</script>
