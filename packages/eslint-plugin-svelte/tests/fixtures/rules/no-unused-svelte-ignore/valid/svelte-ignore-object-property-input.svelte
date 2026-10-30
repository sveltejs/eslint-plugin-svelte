<script>
	import { setContext } from 'svelte';

	let { value } = $props();

	setContext('probe', {
		// svelte-ignore state_referenced_locally
		value
	});
</script>