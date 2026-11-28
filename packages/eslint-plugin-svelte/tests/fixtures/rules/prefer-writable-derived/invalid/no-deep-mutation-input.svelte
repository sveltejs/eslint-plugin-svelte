<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<p>{user.name.trim()}</p>
<button onclick={() => (user = { name: 'foo' })}>reset</button>
