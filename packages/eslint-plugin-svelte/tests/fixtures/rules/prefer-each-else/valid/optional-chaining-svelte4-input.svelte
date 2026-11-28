<script>
	export let items;
</script>

<!-- Svelte 4 and older throw an error for a nullish list in `{#each}` -->
{#if items?.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}
