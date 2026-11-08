<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function getUser() {
		return user;
	}
	const getItems = () => user.items;
</script>

<button onclick={() => (getUser().name = 'foo')}>{user.name}</button>
<button onclick={() => getItems().push(1)}>{user.items.length}</button>
