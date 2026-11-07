<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const result = [0].map((item) => {
		item = items;
		return item;
	});
	result[0][0].done = true;
</script>
