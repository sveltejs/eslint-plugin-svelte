<script>
	let loading = false;
	let items = [];
	let others = [];
</script>

<!-- No `{:else}` branch -->
{#if items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

<!-- Followed by an `{:else if}` branch -->
{#if items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else if loading}
	<p>Loading...</p>
{:else}
	<p>No items</p>
{/if}

<!-- Other content next to the `{#each}` block -->
{#if items.length}
	<h2>Items</h2>
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if !items.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
	<p>Total: {items.length}</p>
{/if}

<!-- The `{#each}` block already has an `{:else}` block -->
{#if items.length}
	{#each items as item}
		<p>{item}</p>
	{:else}
		<p>Unreachable</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

<!-- The `{#each}` block is in the wrong branch -->
{#if items.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if !items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

<!-- A different list is checked -->
{#if others.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

<!-- The condition is not only a length check -->
{#if items.length > 1}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>One item or less</p>
{/if}

{#if items.length && !loading}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items['length']}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items.size}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}
