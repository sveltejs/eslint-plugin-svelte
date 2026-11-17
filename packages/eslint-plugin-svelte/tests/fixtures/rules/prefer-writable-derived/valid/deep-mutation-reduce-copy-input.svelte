<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const last = [...items].reduce((acc, item) => item);
	last.done = true;
</script>
