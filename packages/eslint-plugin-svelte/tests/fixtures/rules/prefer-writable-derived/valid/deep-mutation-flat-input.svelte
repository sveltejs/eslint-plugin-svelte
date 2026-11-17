<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function done() {
		[[...items], []].flat().forEach((item) => (item.done = true));
	}
</script>

<button onclick={done}>done</button>
