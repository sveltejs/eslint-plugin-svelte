<script>
	import { flip } from 'svelte/animate';

	let active = $state(false);
	const items = [{ id: 1 }];
</script>

{#each items as item (item.id)}
	<div class:active={active} animate:flip={{ duration: 200 }}>{item.id}</div>
{/each}