<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const sorted = $derived([...items].sort((a, b) => a.order - b.order));
</script>

{#each sorted as item (item.id)}
	<input type="checkbox" bind:checked={item.done} />
{/each}
