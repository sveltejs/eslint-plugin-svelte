<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const helper = {
		toString() {
			this.item.done = true;
			return 'x';
		}
	};
	[1, 2].sort(() => ({ ...helper, item: items[0] }));
</script>
