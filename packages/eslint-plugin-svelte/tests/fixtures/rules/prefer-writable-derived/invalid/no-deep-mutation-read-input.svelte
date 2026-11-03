<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
	const show = (u) => u.name;
	const json = $derived(JSON.stringify($state.snapshot(user)));
</script>

{#each user.items as item (item.id)}
	<p>{item.name.toUpperCase()}</p>
{/each}
{#each Object.entries(user) as [key, value]}
	<p>{key}: {String(value)}</p>
{/each}
<p>{show(user)} {json}</p>
<p>{user.items.map((item) => item.name).join(', ')}</p>
<p>{user.items.filter(Boolean).sort().length}</p>
<p class={user.className} title={user.name}>{user.name}</p>
<input bind:value={user} />
