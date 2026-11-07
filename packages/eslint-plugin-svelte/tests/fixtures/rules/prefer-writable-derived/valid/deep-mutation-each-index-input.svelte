<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#each user.items as _, i (i)}
	<input bind:value={user.items[i].name} />
{/each}
