<script>
	let loading = false;
	let data = { items: [] };
</script>

{#if loading}
	<p>Loading...</p>
{:else if data.items.length}
	{#each data.items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if loading}
	<p>Loading...</p>
{:else if !data.items.length}
	<p>No items</p>
{:else}
	{#each data.items as item}
		<p>{item}</p>
	{/each}
{/if}

<ul>
	{#if data.items.length}{#each data.items as item}<li>{item}</li>{/each}{:else}<li>None</li>{/if}
</ul>
