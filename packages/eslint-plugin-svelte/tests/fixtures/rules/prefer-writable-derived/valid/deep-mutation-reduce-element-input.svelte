<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function markAll() {
		user.items.reduce((count, item) => {
			item.seen = true;
			return count + 1;
		}, 0);
	}
</script>

<button onclick={markAll}>{user.items.length}</button>
