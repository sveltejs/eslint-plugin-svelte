<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#each user.items as item (item.id)}
	<button onclick={() => (item.done = true)}>{item.name}</button>
{/each}
