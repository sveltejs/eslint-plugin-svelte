<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function complete(id) {
		user.items.find((item) => item.id === id).done = true;
	}
</script>

<button onclick={() => complete(1)}>{user.items.length}</button>
