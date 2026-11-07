<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const log = {
		push(list) {
			list[0].done = true;
		}
	};
	log.push(items);
</script>
