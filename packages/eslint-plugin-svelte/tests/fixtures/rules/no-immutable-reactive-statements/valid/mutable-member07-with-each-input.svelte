<script>
	const values = [['a'], ['b']];
	$: first = values[0][0];
</script>

{first}
{#each values as [value]}
	<input bind:value />
{/each}
