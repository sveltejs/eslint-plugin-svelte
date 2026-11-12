<script lang="ts">
	import { writable } from 'svelte/store';
	const s = writable<Record<string, number>>({});
	const items: string[] = $state([]);
</script>

{#each items as a}{$s.a}{/each}
{#each items as i}{$s[i]}{/each}
{#snippet row(a: string)}{$s.a}{/snippet}
