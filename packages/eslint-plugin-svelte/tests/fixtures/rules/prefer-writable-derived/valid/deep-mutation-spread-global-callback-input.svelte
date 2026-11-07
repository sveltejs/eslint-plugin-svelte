<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	Array.from(...[items, (item) => (item.done = true)]);
</script>
