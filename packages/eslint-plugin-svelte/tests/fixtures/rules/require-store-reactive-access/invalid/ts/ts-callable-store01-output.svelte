<script lang="ts">
	import type { Readable } from 'svelte/store';

	export let store: Readable<() => void>;
	$store();
	$store`x`;
</script>

<button use:$store>a</button>
<button on:click={$store}>b</button>
<div transition:$store></div>
