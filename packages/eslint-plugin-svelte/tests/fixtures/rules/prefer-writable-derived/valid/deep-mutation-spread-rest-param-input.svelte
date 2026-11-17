<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function mark(...rest) {
		rest[1].done = true;
	}
</script>

<button onclick={() => mark(0, ...items)}>mark</button>
<p>{items.map((item) => item.name).join(', ')}</p>
