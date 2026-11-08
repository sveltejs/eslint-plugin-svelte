<script>
	const { data } = $props();
	let user = $state(data.user);
	$effect(() => {
		user = data.user;
	});
</script>

{#await user then value}
	<input bind:value={value.name} />
{/await}
