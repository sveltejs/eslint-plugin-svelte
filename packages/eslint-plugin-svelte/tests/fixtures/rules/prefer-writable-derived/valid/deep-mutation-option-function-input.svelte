<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	let selected = $state();
</script>

<select bind:value={selected}>
	<option value={() => items}>items</option>
</select>
<button onclick={() => (selected()[0].done = true)}>done</button>
