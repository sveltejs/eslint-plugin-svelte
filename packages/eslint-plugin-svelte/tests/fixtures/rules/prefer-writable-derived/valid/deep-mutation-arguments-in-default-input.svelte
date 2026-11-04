<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function mark(list, get = () => arguments[0]) {
		get()[0].done = true;
	}
</script>

<button onclick={() => mark(items)}>mark</button>
<p>{items.map((item) => item.name).join(', ')}</p>
