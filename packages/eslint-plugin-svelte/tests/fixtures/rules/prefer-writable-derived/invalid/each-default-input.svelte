<script>
	const { data } = $props();
	let items = $state(data.items);
	$effect(() => {
		items = data.items;
	});
</script>

{#each items as { name = 'unknown' }}
	<p>{name}</p>
{/each}
{#each items as [key = 0, value]}
	<p>{key} {value}</p>
{/each}
