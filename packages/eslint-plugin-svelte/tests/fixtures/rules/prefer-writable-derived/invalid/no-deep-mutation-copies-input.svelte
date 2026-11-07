<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const sorted = $derived(user.items.toSorted((a, b) => a.order - b.order));
	const words = $derived(user.name.split(' ').reverse().join(' '));
	const keys = $derived(Object.keys(user).join(', '));
	const ids = $derived(['a', 'b'].filter((id) => user.items.includes(id)));
</script>

{#each sorted as item (item.id)}
	<p>{item.name}</p>
{/each}
<p>{[...user.items].length} {words} {keys} {ids.length}</p>
