<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function complete(item) {
		item.done = true;
	}
</script>

<button onclick={() => user.items.forEach(complete)}>{user.items.length}</button>
