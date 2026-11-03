<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let stores: Readable<number>[];
</script>

{#each stores as store}
	<p>{store}</p>
{/each}
