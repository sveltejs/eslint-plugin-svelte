<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const box = { items };
	box.forEach = function () {
		this.items[0].done = true;
	};
	box.forEach();
</script>
