<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
	const isCheck = $derived(items instanceof window.Check);
</script>

<p>{isCheck}</p>
