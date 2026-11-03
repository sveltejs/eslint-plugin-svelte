<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => ((u) => (u.name = 'foo'))(user)}>{user.name}</button>
