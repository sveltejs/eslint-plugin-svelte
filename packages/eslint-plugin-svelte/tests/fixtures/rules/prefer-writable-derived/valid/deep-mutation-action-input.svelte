<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function rename(node, u) {
		node.addEventListener('click', () => (u.name = 'foo'));
	}
</script>

<button use:rename={user}>{user.name}</button>
