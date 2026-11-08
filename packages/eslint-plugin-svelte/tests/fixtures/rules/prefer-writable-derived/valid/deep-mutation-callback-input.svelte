<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function completeAll() {
		user.items.forEach((item) => {
			item.done = true;
		});
	}
</script>

<button onclick={completeAll}>{user.items.length}</button>
