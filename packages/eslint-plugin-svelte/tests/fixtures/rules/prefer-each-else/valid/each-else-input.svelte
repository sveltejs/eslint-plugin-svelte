<script>
	let items = [];
</script>

{#each items as item}
	<p>{item}</p>
{:else}
	<p>No items</p>
{/each}
