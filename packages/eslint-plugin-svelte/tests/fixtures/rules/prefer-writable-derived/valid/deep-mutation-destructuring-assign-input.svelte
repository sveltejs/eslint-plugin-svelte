<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	function update(value) {
		({ name: user.name } = value);
		[user.age] = [1];
	}
</script>

<button onclick={() => update({ name: 'foo' })}>{user.name}</button>
