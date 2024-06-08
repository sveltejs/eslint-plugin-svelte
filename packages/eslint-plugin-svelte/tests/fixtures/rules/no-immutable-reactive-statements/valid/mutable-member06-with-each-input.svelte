<script>
	const values = [{ a: 'a' }, { a: 'b' }];
	$: first = values[0].a;
</script>

{first}
{#each values as { a }}
	<input bind:value={a} />
{/each}
