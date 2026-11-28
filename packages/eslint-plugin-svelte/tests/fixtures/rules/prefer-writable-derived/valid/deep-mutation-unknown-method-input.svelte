<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

<button onclick={() => user.rename('foo')}>rename</button>
