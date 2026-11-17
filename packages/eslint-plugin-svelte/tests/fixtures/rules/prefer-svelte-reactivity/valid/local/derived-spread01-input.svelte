<script>
	let { items } = $props();
	const unique = $derived([...new Set(items)]);
</script>
