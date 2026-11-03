<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const values = $derived(Object.keys(user).map((key) => user[key]));
</script>

<p>{values.length}</p>
