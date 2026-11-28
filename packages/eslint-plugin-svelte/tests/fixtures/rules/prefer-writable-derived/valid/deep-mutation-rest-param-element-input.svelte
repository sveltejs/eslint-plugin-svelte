<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function rename(...users) {
		users[0].name = 'foo';
	}
</script>

<button onclick={() => rename(user)}>{user.name}</button>
