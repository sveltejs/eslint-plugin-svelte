<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const getItems = () => user.items;
	const items = $derived.by(getItems);
</script>

<button onclick={() => items.push(1)}>{items.length}</button>
