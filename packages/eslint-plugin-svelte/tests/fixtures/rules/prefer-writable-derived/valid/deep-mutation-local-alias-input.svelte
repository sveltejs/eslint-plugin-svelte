<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function rename() {
		const { profile } = user;
		profile.name = 'foo';
	}
</script>

<button onclick={rename}>{user.profile.name}</button>
