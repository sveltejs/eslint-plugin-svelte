<script>
	const { n, load } = $props();
	let value = $state(0);
	$effect(async () => {
		value = await load(n);
	});
</script>

<p>{value}</p>
