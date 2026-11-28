<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	function toggle() {
		arguments[0][0].done = true;
	}
</script>

<button onclick={() => toggle(items)}>toggle</button>
