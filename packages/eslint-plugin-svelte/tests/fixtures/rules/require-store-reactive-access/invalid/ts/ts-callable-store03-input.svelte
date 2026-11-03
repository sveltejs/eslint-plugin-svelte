<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let store: Readable<() => void>;
</script>

<button onclick={store}>c</button>
