<script>
	let items = [];
</script>

{#if !items.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if items.length === 0}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if items.length == 0}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if items.length < 1}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if items.length <= 0}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if 0 === items.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}

{#if 1 > items.length}
	<p>No items</p>
{:else}
	{#each items as item}
		<p>{item}</p>
	{/each}
{/if}
