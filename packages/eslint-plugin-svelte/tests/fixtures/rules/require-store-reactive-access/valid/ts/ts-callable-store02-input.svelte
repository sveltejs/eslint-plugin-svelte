<script lang="ts">
	import type { Readable } from 'svelte/store';

	let {
		handler,
		onclick
	}: {
		handler: Readable<number> & ((e: MouseEvent) => void);
		onclick: Readable<number> & ((e: MouseEvent) => void);
	} = $props();
</script>

<button onclick={handler}>click</button>
<button {onclick}>click</button>
