<script lang="ts">
	import { writable, Writable } from 'svelte/store';
	let store: Writable<number> | null = null;
	const constStore = writable('hello');
</script>

<!-- ignore -->
{#if store}
	<div class:foo={$store} />
{/if}
{#if $constStore}
	<div class:foo={$constStore} />
{/if}
