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
</script>

<svelte:element this={{ ...helper, item: items[0] }} />
