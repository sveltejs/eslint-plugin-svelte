<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#each user.items as item (item.id)}
	<input bind:value={item.name} />
{/each}
