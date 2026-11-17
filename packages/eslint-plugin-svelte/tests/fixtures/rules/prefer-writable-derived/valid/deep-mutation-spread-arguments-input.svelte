<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function mark() {
		arguments[0].done = true;
	}
</script>

<button onclick={() => mark(...items)}>mark</button>
<p>{items.map((item) => item.name).join(', ')}</p>
