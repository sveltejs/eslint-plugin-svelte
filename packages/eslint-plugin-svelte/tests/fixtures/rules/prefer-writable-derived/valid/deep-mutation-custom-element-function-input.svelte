<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
</script>

<x-list getter={() => items}></x-list>
