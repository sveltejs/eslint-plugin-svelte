<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	[0].map(function f(item, index) {
		if (index === 0) f(items, 1)[0].done = true;
		return item;
	});
</script>
