<svelte:options customElement="x-list" />

<script>
	let items = $state([]);
	$effect(() => {
		items = data.items;
	});
	const { data, list = items } = $props();
</script>

<p>{list.length}</p>
