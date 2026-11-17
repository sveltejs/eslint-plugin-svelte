<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function completeAll() {
		for (const item of user.items) item.done = true;
	}
</script>

<button onclick={completeAll}>{user.items.length}</button>
