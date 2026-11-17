<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const json = $derived(
		JSON.stringify(items, (key, value) => {
			if (Array.isArray(value)) value[0].done = true;
			return value;
		})
	);
</script>

<p>{json}</p>
