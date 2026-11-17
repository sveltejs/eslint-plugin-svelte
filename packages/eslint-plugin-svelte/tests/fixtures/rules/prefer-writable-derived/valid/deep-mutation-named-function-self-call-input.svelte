<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const id = function f(value, n) {
		if (n) {
			f(value, 0)[0].done = true;
			return 0;
		}
		return value;
	};
	id(items, 1);
</script>
