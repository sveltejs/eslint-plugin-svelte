<script>
	const { items } = $props();
	let list = $state(items);
	$effect(() => {
		list = items;
	});
</script>

<button onclick={() => list.push(list.length)}>{list.length}</button>
