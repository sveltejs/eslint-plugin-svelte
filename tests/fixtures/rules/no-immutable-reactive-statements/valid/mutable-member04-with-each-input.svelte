<script>
	const values = [['a'], ['b']];
	$: first = values[0][0];
</script>

{first}
{#each values as a}
	{#each a as value}
		<input bind:value />
	{/each}
{/each}
