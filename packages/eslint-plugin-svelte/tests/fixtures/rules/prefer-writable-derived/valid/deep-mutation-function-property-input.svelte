<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const box = {
		items,
		at: function (index) {
			this.items[index].done = true;
		}
	};
	box.at(0);
</script>
