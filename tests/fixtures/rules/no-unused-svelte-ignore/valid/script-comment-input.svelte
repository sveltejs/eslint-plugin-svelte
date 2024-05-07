<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	// svelte-ignore state_referenced_locally
	console.log(count);
	// svelte-ignore state_referenced_locally
	console.log(doubled);
</script>
