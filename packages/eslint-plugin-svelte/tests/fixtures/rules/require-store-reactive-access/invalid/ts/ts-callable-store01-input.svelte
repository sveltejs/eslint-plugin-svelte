<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let store: Readable<() => void>;
	store();
</script>

<button use:store>a</button>
<button on:click={store}>b</button>
<button onclick={store}>c</button>
<div transition:store></div>
