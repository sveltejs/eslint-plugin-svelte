<script>
	import { writable } from 'svelte/store';
	let store = writable('hello');
	const constStore = writable('hello');
</script>

<!-- ignore -->
{#if store}
	<div class:foo={store} />
{/if}
{#if constStore}
	<div class:foo={constStore} />
{/if}
