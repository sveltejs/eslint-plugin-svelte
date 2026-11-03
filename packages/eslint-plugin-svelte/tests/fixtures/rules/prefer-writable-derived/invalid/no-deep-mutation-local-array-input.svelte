<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const ids = $derived(['a', 'b'].filter((id) => user.items.includes(id)));
	const names = $derived(['a', 'b'].map((id) => user.byId[id].name));
</script>

<p>{ids.length} {names.join(', ')}</p>
