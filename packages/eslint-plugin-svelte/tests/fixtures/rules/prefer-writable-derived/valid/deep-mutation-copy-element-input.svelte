<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function completeFirst() {
		const items = user.items.slice();
		items[0].done = true;
	}
</script>

<button onclick={completeFirst}>{user.items.length}</button>
