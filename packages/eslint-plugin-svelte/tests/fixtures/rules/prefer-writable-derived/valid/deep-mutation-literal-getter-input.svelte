<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const box = {
		items,
		get first() {
			this.items[0].done = true;
			return 1;
		}
	};
</script>

<p>{box.first}</p>
