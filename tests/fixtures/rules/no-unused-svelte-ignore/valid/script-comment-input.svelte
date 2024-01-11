<script>
	let count = $state(0);
	let doubled = $derived(count * 2);
	// svelte-ignore static-state-reference
	console.log(count);
	// svelte-ignore static-state-reference
	console.log(doubled);
</script>
