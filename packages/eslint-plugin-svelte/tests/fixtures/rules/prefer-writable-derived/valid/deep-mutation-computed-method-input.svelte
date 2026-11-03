<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => user.items['push'](1)}>{user.items.length}</button>
