<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const result = [undefined].map((item = items) => item);
	result[0][0].done = true;
</script>
