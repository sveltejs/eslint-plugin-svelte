<script>
	const { data, cache } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	$effect(() => {
		cache.user = user;
	});
</script>
