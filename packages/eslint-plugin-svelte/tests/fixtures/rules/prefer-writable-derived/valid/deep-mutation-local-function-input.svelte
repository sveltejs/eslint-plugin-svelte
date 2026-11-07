<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const rename = (u) => {
		u.name = 'foo';
	};
</script>

<button onclick={() => rename(user)}>{user.name}</button>
