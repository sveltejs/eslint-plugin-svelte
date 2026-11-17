<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const total = $derived(user.items.reduce((sum, item) => sum + item.price, 0));
	const names = $derived.by(() => {
		let result = '';
		for (const item of user.items) result += item.name;
		return result;
	});
	const first = $derived.by(() => user.items[0]);
</script>

<p>{total} {names} {first?.name}</p>
{#each user.items}
	<p>item</p>
{/each}
<button onclick={() => console.log(user.name)}>button</button>
