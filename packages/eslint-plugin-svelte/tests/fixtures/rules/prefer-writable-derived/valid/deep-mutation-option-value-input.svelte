<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	let selected = $state();
</script>

<select bind:value={selected}>
	{#each items as item (item.id)}
		<option value={item}>{item.name}</option>
	{/each}
</select>
<button onclick={() => (selected.done = true)}>done</button>
