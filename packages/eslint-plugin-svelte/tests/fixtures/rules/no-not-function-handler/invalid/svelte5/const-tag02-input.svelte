<script lang="ts">
	let items: number[] = $state([1, 2]);
</script>

{#each items as item (item)}
	{@const h: number = 1}
	<button onclick={h}>a</button>
{/each}
