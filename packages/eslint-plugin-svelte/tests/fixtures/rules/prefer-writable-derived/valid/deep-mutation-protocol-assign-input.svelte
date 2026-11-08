<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const box = [items];
	box.toString = function () {
		this[0][0].done = true;
		return '';
	};
</script>

<p>{String(box)}</p>
