<script>
	let items = [];
</script>

{#if items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items.length > 0}
	{#each items as item (item)}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items.length !== 0}
	{#each items as item, i}
		<p>{i}: {item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items.length != 0}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if items.length >= 1}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if 0 < items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if !!items.length}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}

{#if !(items.length === 0)}
	{#each items as item}
		<p>{item}</p>
	{/each}
{:else}
	<p>No items</p>
{/if}
