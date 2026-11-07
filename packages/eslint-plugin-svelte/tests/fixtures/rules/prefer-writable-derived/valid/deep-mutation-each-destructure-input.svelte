<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#each user.items as { tags }, i (i)}
	<button onclick={() => tags.push('a')}>{tags.length}</button>
{/each}
