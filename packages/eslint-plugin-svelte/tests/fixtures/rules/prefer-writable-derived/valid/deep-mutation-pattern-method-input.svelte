<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const copy = [...items];
	[copy.map] = [
		function () {
			this[0].done = true;
			return [];
		}
	];
	copy.map(() => 0);
</script>
