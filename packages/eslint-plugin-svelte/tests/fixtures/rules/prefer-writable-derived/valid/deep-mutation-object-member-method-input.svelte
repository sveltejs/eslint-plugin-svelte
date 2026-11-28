<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const helpers = {
		m() {
			this.items[0].done = true;
		}
	};
	const box = { items, map: helpers.m };
	box.map(() => 0);
</script>
