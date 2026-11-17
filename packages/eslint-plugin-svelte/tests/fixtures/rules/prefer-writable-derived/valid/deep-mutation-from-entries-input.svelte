<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const byName = $derived(Object.fromEntries(items.map((item) => [item.name, item])));
</script>

<button onclick={() => (byName.a.done = true)}>done</button>
