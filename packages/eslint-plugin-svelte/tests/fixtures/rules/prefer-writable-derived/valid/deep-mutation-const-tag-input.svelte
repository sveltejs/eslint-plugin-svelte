<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#if user}
	{@const profile = user.profile}
	<input bind:value={profile.name} />
{/if}
