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
	const result = items.map((item) => ({ ...helper, item }));
	String(result[0]);
</script>
