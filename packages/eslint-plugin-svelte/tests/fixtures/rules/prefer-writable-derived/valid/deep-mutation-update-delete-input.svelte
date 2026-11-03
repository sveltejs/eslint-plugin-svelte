<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => user.count++}>{user.count}</button>
<button onclick={() => delete user.name}>{user.name}</button>
