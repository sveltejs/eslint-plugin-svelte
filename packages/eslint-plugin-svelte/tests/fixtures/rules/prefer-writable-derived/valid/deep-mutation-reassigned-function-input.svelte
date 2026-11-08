<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	let toggle = (list) => list;
	toggle = (list) => {
		list[0].done = true;
	};
</script>

<button onclick={() => toggle(items)}>toggle</button>
