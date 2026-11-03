<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let handler: Readable<number> & ((e: MouseEvent) => void);
	export let onclick: Readable<number> & ((e: MouseEvent) => void);
</script>

<!-- Svelte 3/4 does not treat `on*` attributes as event handlers -->
<button onclick={handler}>click</button>
<button {onclick}>click</button>
