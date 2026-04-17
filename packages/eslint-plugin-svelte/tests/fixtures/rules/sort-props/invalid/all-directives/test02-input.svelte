<script>
	import { flip } from 'svelte/animate';

	let active = $state(false);
	const items = [{ id: 1 }];
</script>

{#each items as item (item.id)}
	<div animate:flip={{ duration: 200 }} class:active={active}>{item.id}</div>
{/each}