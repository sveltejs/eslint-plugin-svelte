<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const box = {
		set value(list) {
			list[0].done = true;
		}
	};
	box.value = items;
</script>
