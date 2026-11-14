<script>
	let { items, data } = $props();
</script>

{#if items?.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items?.length > 0}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if !items?.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if !(items?.length > 0)}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if data?.items.length}
	{#each data?.items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}
