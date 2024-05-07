<script lang="ts">
	let count = $state(0);
	let doubled = $derived(count * 2);
	// svelte-ignore state_referenced_locally
	console.log(count as any);
	// svelte-ignore state_referenced_locally
	console.log(doubled!);
</script>
