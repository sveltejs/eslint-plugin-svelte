<script>
	export let items;
</script>

<!-- These conditions treat a nullish list differently from an empty one -->
{#if items?.length !== 0}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items?.length === 0}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if !(items?.length <= 0)}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}
