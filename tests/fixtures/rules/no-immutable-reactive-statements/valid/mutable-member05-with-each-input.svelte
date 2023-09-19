<script>
	const values = ['a', 'b'];
	$: first = values[0];
</script>

{first}
{values}
{#each values as value}
	<button on:click={() => (value = 'foo')}>Foo</button>
{/each}
