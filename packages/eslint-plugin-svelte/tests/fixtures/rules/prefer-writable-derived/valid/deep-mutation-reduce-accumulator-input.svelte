<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const byId = $derived(
		user.items.reduce((acc, item) => {
			acc[item.id] = item;
			return acc;
		}, {})
	);
</script>

<button onclick={() => (byId.a.name = 'foo')}>{byId.a.name}</button>
