<script>
	let items = [1, 2, 3];
</script>

{#if items.length}
	{const total = items.reduce((a, b) => a + b, 0)}
	Total: {total}
{/if}

{#snippet row(value)}
	{ const doubled = value * 2 }
	{doubled}
{/snippet}
